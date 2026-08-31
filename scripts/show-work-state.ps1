[CmdletBinding()]
param(
  [ValidateSet('Text', 'Json')]
  [string]$Format = 'Text'
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path

function Get-BoldField {
  param(
    [Parameter(Mandatory)][string]$Content,
    [Parameter(Mandatory)][string]$Name
  )

  $escapedName = [regex]::Escape($Name)
  $match = [regex]::Match($Content, "(?m)^\*\*${escapedName}:\*\*\s*(?<value>.+)$")
  if (-not $match.Success) {
    return $null
  }

  return $match.Groups['value'].Value.Trim()
}

function Convert-TaskRecordStatus {
  param([string]$Marker)

  switch ($Marker) {
    '[x]' { return 'COMPLETE' }
    '[~]' { return 'IN_PROGRESS' }
    '[?]' { return 'BLOCKED' }
    '[!]' { return 'FAILED' }
    '[ ]' { return 'NOT_STARTED' }
    default { return 'UNKNOWN' }
  }
}

$runbookPath = Join-Path $projectRoot 'docs/runbooks/poc-execution-runbook.md'
$decisionRegisterPath = Join-Path $projectRoot 'planning/decision-register.md'
$taskRecordRoot = Join-Path $projectRoot 'planning/tasks'

foreach ($requiredPath in @($runbookPath, $decisionRegisterPath, $taskRecordRoot)) {
  if (-not (Test-Path -LiteralPath $requiredPath)) {
    throw "Required work-state source is missing: $requiredPath"
  }
}

$runbook = Get-Content -LiteralPath $runbookPath -Raw
$taskMatches = [regex]::Matches($runbook, '(?m)^#### (WP\d{2}-T\d{2}) — (.+)$')
$runbookTasks = [System.Collections.Generic.List[object]]::new()

for ($index = 0; $index -lt $taskMatches.Count; $index++) {
  $start = $taskMatches[$index].Index
  $end = if ($index + 1 -lt $taskMatches.Count) { $taskMatches[$index + 1].Index } else { $runbook.Length }
  $block = $runbook.Substring($start, $end - $start)
  $markers = @([regex]::Matches($block, '(?m)^- \[(?<marker>[ ~?!x])\] .+$') | ForEach-Object { $_.Groups['marker'].Value })

  $status = if ($markers -contains '!') {
    'FAILED'
  } elseif ($markers -contains '?') {
    'BLOCKED'
  } elseif ($markers.Count -gt 0 -and @($markers | Where-Object { $_ -ne 'x' }).Count -eq 0) {
    'COMPLETE'
  } elseif ($markers -contains '~' -or $markers -contains 'x') {
    'IN_PROGRESS'
  } else {
    'NOT_STARTED'
  }

  $taskId = $taskMatches[$index].Groups[1].Value
  $runbookTasks.Add([pscustomobject][ordered]@{
    taskId = $taskId
    title = $taskMatches[$index].Groups[2].Value.Trim()
    workPackage = $taskId.Substring(0, 4)
    status = $status
  })
}

$decisionRegister = Get-Content -LiteralPath $decisionRegisterPath
$decisions = [System.Collections.Generic.List[object]]::new()
$blockedTaskIds = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
$resolutionTaskIds = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)

foreach ($line in $decisionRegister | Where-Object { $_ -match '^\| D-\d{2} \|' }) {
  $parts = @($line.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() })
  if ($parts.Count -ne 9) {
    throw "Malformed decision-register row: $line"
  }

  $decision = [pscustomobject][ordered]@{
    id = $parts[0]
    decision = $parts[1]
    owner = $parts[2]
    due = $parts[3]
    status = $parts[4]
    record = $parts[5]
    resolutionPath = $parts[6]
    blocks = $parts[7]
    lastReviewed = $parts[8]
  }
  $decisions.Add($decision)

  if ($decision.status -in @('Open', 'Proposed')) {
    foreach ($taskIdMatch in [regex]::Matches($decision.blocks, 'WP\d{2}-T\d{2}')) {
      [void]$blockedTaskIds.Add($taskIdMatch.Value)
    }
    foreach ($taskIdMatch in [regex]::Matches($decision.resolutionPath, 'WP\d{2}-T\d{2}')) {
      [void]$resolutionTaskIds.Add($taskIdMatch.Value)
    }
  }
}

$taskRecords = [System.Collections.Generic.List[object]]::new()
$recordBlockedTaskIds = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)

foreach ($file in Get-ChildItem -LiteralPath $taskRecordRoot -File -Filter '*.md' | Sort-Object Name) {
  $content = Get-Content -LiteralPath $file.FullName -Raw
  $statusMarker = Get-BoldField -Content $content -Name 'Status'
  $status = Convert-TaskRecordStatus -Marker $statusMarker
  $taskId = Get-BoldField -Content $content -Name 'Task ID'
  $matchingRunbookTask = $runbookTasks | Where-Object taskId -eq $taskId | Select-Object -First 1
  if ($null -eq $matchingRunbookTask) {
    throw "Task record has no matching runbook task: $taskId"
  }
  if ($status -ne $matchingRunbookTask.status) {
    throw "Task status differs between record and runbook for ${taskId}: record=$status runbook=$($matchingRunbookTask.status)"
  }

  if ($status -in @('BLOCKED', 'FAILED')) {
    [void]$recordBlockedTaskIds.Add($taskId)
  }

  $taskRecords.Add([pscustomobject][ordered]@{
    taskId = $taskId
    status = $status
    outcome = Get-BoldField -Content $content -Name 'Outcome'
    owner = Get-BoldField -Content $content -Name 'Owner'
    reviewer = Get-BoldField -Content $content -Name 'Reviewer'
    nextSafeAction = Get-BoldField -Content $content -Name 'Next safe action'
    record = [System.IO.Path]::GetRelativePath($projectRoot, $file.FullName).Replace('\', '/')
  })
}

$firstUnfinishedTask = $runbookTasks | Where-Object status -ne 'COMPLETE' | Select-Object -First 1
$currentWorkPackage = if ($null -ne $firstUnfinishedTask) { $firstUnfinishedTask.workPackage } else { $null }
$recommendedTask = $null
$routingMode = 'strict-package-order'

if ($null -ne $currentWorkPackage) {
  $currentPackageTasks = @($runbookTasks | Where-Object workPackage -eq $currentWorkPackage)
  $recommendedTask = $currentPackageTasks |
    Where-Object {
      $_.status -eq 'IN_PROGRESS' -and
      -not $blockedTaskIds.Contains($_.taskId) -and
      -not $recordBlockedTaskIds.Contains($_.taskId)
    } |
    Select-Object -First 1

  if ($null -eq $recommendedTask) {
    $recommendedTask = $currentPackageTasks |
      Where-Object {
        $_.status -eq 'NOT_STARTED' -and
        -not $blockedTaskIds.Contains($_.taskId) -and
        -not $recordBlockedTaskIds.Contains($_.taskId)
      } |
      Select-Object -First 1
  }

  # WP00 deliberately permits unresolved real choices when their mocks and
  # downstream blockers have passed the constraints-only gate. That reviewed
  # gate unlocks only the mock-only WP01 foundation, never a real adapter.
  if ($null -eq $recommendedTask -and $currentWorkPackage -eq 'WP00') {
    $wp00Gate = $runbookTasks | Where-Object taskId -eq 'WP00-T08' | Select-Object -First 1
    if ($null -ne $wp00Gate -and $wp00Gate.status -eq 'COMPLETE') {
      $wp01Tasks = @($runbookTasks | Where-Object workPackage -eq 'WP01')
      $recommendedTask = $wp01Tasks |
        Where-Object {
          $_.status -eq 'IN_PROGRESS' -and
          -not $blockedTaskIds.Contains($_.taskId) -and
          -not $recordBlockedTaskIds.Contains($_.taskId)
        } |
        Select-Object -First 1

      if ($null -eq $recommendedTask) {
        $recommendedTask = $wp01Tasks |
          Where-Object {
            $_.status -eq 'NOT_STARTED' -and
            -not $blockedTaskIds.Contains($_.taskId) -and
            -not $recordBlockedTaskIds.Contains($_.taskId)
          } |
          Select-Object -First 1
      }

      if ($null -ne $recommendedTask) {
        $currentWorkPackage = 'WP01'
        $routingMode = 'reviewed-wp00-mock-bridge'
      }

      # Once the whole WP01 foundation and its package gate are complete, the
      # delivery table permits eligible WP02 database work. Open real-choice
      # decisions and protected gates retain their task-level blocks.
      if ($null -eq $recommendedTask) {
        $unfinishedWp01Tasks = @($wp01Tasks | Where-Object status -ne 'COMPLETE')
        $wp01Gate = $wp01Tasks | Where-Object taskId -eq 'WP01-T11' | Select-Object -First 1

        if ($unfinishedWp01Tasks.Count -eq 0 -and $null -ne $wp01Gate -and $wp01Gate.status -eq 'COMPLETE') {
          $wp02Tasks = @($runbookTasks | Where-Object workPackage -eq 'WP02')
          $recommendedTask = $wp02Tasks |
            Where-Object {
              $_.status -eq 'IN_PROGRESS' -and
              -not $blockedTaskIds.Contains($_.taskId) -and
              -not $recordBlockedTaskIds.Contains($_.taskId)
            } |
            Select-Object -First 1

          if ($null -eq $recommendedTask) {
            $recommendedTask = $wp02Tasks |
              Where-Object {
                $_.status -eq 'NOT_STARTED' -and
                -not $blockedTaskIds.Contains($_.taskId) -and
                -not $recordBlockedTaskIds.Contains($_.taskId)
              } |
              Select-Object -First 1
          }

          if ($null -ne $recommendedTask) {
            $currentWorkPackage = 'WP02'
            $routingMode = 'reviewed-wp01-foundation-bridge'
          }
        }
      }
    }
  }
}

$recommendation = if ($null -ne $recommendedTask) {
  $reason = if ($routingMode -eq 'reviewed-wp00-mock-bridge') {
    'WP00-T08 passed the mock-only constraints gate; unresolved real choices remain blocked while the earliest eligible WP01 foundation task advances.'
  } elseif ($routingMode -eq 'reviewed-wp01-foundation-bridge') {
    'WP01-T11 passed the foundation package gate; unresolved real choices and protected gates retain their exact blocks while the earliest eligible WP02 database task advances.'
  } else {
    "Earliest executable task in $currentWorkPackage after excluding failed, completed, decision-blocked, and record-blocked tasks."
  }
  [pscustomobject][ordered]@{
    taskId = $recommendedTask.taskId
    title = $recommendedTask.title
    status = $recommendedTask.status
    reason = $reason
  }
} else {
  $null
}

$openDecisions = @($decisions | Where-Object status -in @('Open', 'Proposed'))
$state = [pscustomobject][ordered]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString('o')
  currentWorkPackage = $currentWorkPackage
  routingMode = $routingMode
  recommendedTask = $recommendation
  activeTaskRecords = @($taskRecords | Where-Object status -ne 'COMPLETE')
  openDecisions = $openDecisions
  blockedTaskIds = @($blockedTaskIds | Sort-Object)
  resolutionTaskIds = @($resolutionTaskIds | Sort-Object)
}

if ($Format -eq 'Json') {
  $state | ConvertTo-Json -Depth 6
  exit 0
}

Write-Output "Current work package: $($state.currentWorkPackage)"
Write-Output "Routing mode: $($state.routingMode)"
if ($null -eq $state.recommendedTask) {
  Write-Output 'Recommended task: NONE — every task in the current package is complete or blocked.'
} else {
  Write-Output "Recommended task: $($state.recommendedTask.taskId) — $($state.recommendedTask.title)"
  Write-Output "Reason: $($state.recommendedTask.reason)"
}
Write-Output "Active task records: $($state.activeTaskRecords.Count)"
foreach ($taskRecord in $state.activeTaskRecords) {
  Write-Output "- $($taskRecord.taskId) [$($taskRecord.status)]: $($taskRecord.nextSafeAction)"
}
Write-Output "Open/proposed decisions: $($state.openDecisions.Count)"
Write-Output "Decision-blocked tasks: $($state.blockedTaskIds.Count)"
