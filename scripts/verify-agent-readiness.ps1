[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$failures = [System.Collections.Generic.List[string]]::new()

function Add-Failure {
  param([Parameter(Mandatory)][string]$Message)

  $failures.Add($Message)
}

$requiredPaths = @(
  'README.md'
  'AGENTS.md'
  'CONTEXT.md'
  'docs/README.md'
  'docs/agents/agent-workflow.md'
  'docs/plans/poc-master-plan.md'
  'docs/runbooks/poc-execution-runbook.md'
  'docs/templates/README.md'
  'docs/templates/task-record.md'
  'docs/policies/raw-data-lifecycle.md'
  'docs/decisions/d-01-human-medicine-cohort.md'
  'docs/decisions/d-02-veterinary-medicine-cohort.md'
  'docs/decisions/d-03-pilot-institutions.md'
  'docs/decisions/d-04-ai-providers.md'
  'docs/decisions/d-05-maximum-poc-spend.md'
  'docs/decisions/d-10-processed-format.md'
  'docs/decisions/d-19-retention-deletion-periods.md'
  'evals/README.md'
  'evals/datasets/README.md'
  'evals/datasets/tutor/README.md'
  'evals/datasets/studio/README.md'
  'planning/README.md'
  'planning/agent-operability-audit.md'
  'planning/cohort-selection-review.md'
  'planning/raw-data-policy-review.md'
  'planning/provider-budget-review.md'
  'planning/decision-register.md'
  'planning/cohort-candidates.csv'
  'planning/source-rights-inventory.csv'
  'planning/provider-benchmark.csv'
  'planning/load-profile-100-students.yaml'
  'evidence/README.md'
  'evidence/wp00-pilot/README.md'
  'scripts/show-work-state.ps1'
  'scripts/test-agent-handoff.ps1'
)

foreach ($relativePath in $requiredPaths) {
  $absolutePath = Join-Path $projectRoot $relativePath
  if (-not (Test-Path -LiteralPath $absolutePath -PathType Leaf)) {
    Add-Failure "Missing required agent entry point: $relativePath"
  }
}

$loadProfilePath = Join-Path $projectRoot 'planning/load-profile-100-students.yaml'
if (Test-Path -LiteralPath $loadProfilePath -PathType Leaf) {
  $loadProfile = Get-Content -LiteralPath $loadProfilePath -Raw
  if ($loadProfile -match 'FILL_ME') {
    Add-Failure 'Load profile still contains FILL_ME.'
  }
  if ($loadProfile -notmatch '(?m)^provider_mode:\s+mock$') {
    Add-Failure 'Load profile is not fixed to mock provider mode.'
  }
  if (@([regex]::Matches($loadProfile, '(?m)^\s+maximum_(?:cost|total_cost):\s+0$')).Count -ne 2) {
    Add-Failure 'Load profile must set both abort and passing maximum cost to zero.'
  }

  $requiredLoadPhases = @(
    'warm_up'
    'realistic_ramp'
    'peak_academic_burst'
    'background_ingestion_overlap'
    'provider_slowdown'
    'worker_death'
    'cooldown'
    'reconciliation'
  )
  foreach ($phaseName in $requiredLoadPhases) {
    if (@([regex]::Matches($loadProfile, "(?m)^\s+- name:\s+$([regex]::Escape($phaseName))$")).Count -ne 1) {
      Add-Failure "Load profile must contain exactly one $phaseName phase."
    }
  }
  foreach ($phaseField in @('duration_seconds', 'virtual_users', 'arrival_rate_per_second', 'concurrency_limit', 'think_time_ms', 'actions')) {
    if (@([regex]::Matches($loadProfile, "(?m)^\s+$phaseField(?:\s*:|:)")).Count -ne $requiredLoadPhases.Count) {
      Add-Failure "Every load phase must define $phaseField."
    }
  }

  $canaries = @([regex]::Matches($loadProfile, '(?m)^\s+canary_phrase:\s+(\S+)$') | ForEach-Object { $_.Groups[1].Value })
  if ($canaries.Count -lt 2 -or @($canaries | Sort-Object -Unique).Count -ne $canaries.Count) {
    Add-Failure 'Load profile needs at least two unique canary phrases.'
  }

  $minimumLoadActions = @{
    login_catalog = 100
    subject_open = 100
    chat_submit = 300
    studio_request = 50
    quiz_attempt = 100
    feedback = 50
    pdf_ingestion = 1
    audio_ingestion = 1
  }
  foreach ($actionName in $minimumLoadActions.Keys) {
    $actionTotal = 0
    foreach ($match in [regex]::Matches($loadProfile, "(?m)^\s+$([regex]::Escape($actionName)):\s+(\d+)$")) {
      $actionTotal += [int]$match.Groups[1].Value
    }
    if ($actionTotal -lt $minimumLoadActions[$actionName]) {
      Add-Failure "Load profile action $actionName totals $actionTotal; minimum is $($minimumLoadActions[$actionName])."
    }
  }
}

$documentationRoots = @('docs', 'evidence', 'evals', 'planning', 'scripts')
$checkedNames = 0
foreach ($relativeRoot in $documentationRoots) {
  $absoluteRoot = Join-Path $projectRoot $relativeRoot
  if (-not (Test-Path -LiteralPath $absoluteRoot -PathType Container)) {
    continue
  }

  foreach ($file in Get-ChildItem -LiteralPath $absoluteRoot -File -Recurse) {
    $relativePath = [System.IO.Path]::GetRelativePath($projectRoot, $file.FullName).Replace('\', '/')
    $checkedNames++

    if ($file.Name -eq 'README.md') {
      continue
    }

    if ($relativePath.StartsWith('evidence/') -and $file.Extension -eq '.md') {
      if ($file.Name -notmatch '^\d{4}-\d{2}-\d{2}_[a-z0-9-]+_[a-z0-9-]+_[a-f0-9]{7,12}\.md$') {
        Add-Failure "Evidence report name does not match the dated convention: $relativePath"
      }
      continue
    }

    if ($file.BaseName -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$' -or $file.Extension -cnotmatch '^\.[a-z0-9]+$') {
      Add-Failure "Authored file name is not lowercase kebab-case: $relativePath"
    }
  }

  foreach ($directory in Get-ChildItem -LiteralPath $absoluteRoot -Directory -Recurse) {
    $relativePath = [System.IO.Path]::GetRelativePath($projectRoot, $directory.FullName).Replace('\', '/')
    if ($directory.Name -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') {
      Add-Failure "Directory name is not lowercase kebab-case: $relativePath"
    }
  }
}

$markdownFiles = @(
  Get-ChildItem -LiteralPath $projectRoot -File -Filter '*.md'
  Get-ChildItem -LiteralPath (Join-Path $projectRoot 'docs') -File -Filter '*.md' -Recurse
  Get-ChildItem -LiteralPath (Join-Path $projectRoot 'evidence') -File -Filter '*.md' -Recurse
  Get-ChildItem -LiteralPath (Join-Path $projectRoot 'evals') -File -Filter '*.md' -Recurse
  Get-ChildItem -LiteralPath (Join-Path $projectRoot 'planning') -File -Filter '*.md' -Recurse
)
$checkedLinks = 0
$linkPattern = '!?' + '\[[^\]]*\]\((?<target>[^)]+)\)'

foreach ($file in $markdownFiles) {
  $content = Get-Content -LiteralPath $file.FullName -Raw
  foreach ($match in [regex]::Matches($content, $linkPattern)) {
    $target = $match.Groups['target'].Value.Trim().Trim('<', '>')
    if ($target -match '^(?:#|[a-z][a-z0-9+.-]*:|/)') {
      continue
    }

    $pathPart = ($target -split '#', 2)[0]
    if ([string]::IsNullOrWhiteSpace($pathPart)) {
      continue
    }

    $checkedLinks++
    $decodedPath = [System.Uri]::UnescapeDataString($pathPart)
    $resolvedPath = Join-Path $file.DirectoryName $decodedPath
    if (-not (Test-Path -LiteralPath $resolvedPath)) {
      $sourcePath = [System.IO.Path]::GetRelativePath($projectRoot, $file.FullName).Replace('\', '/')
      Add-Failure "Broken local link in ${sourcePath}: $target"
    }
  }
}

$runbookPath = Join-Path $projectRoot 'docs/runbooks/poc-execution-runbook.md'
if (Test-Path -LiteralPath $runbookPath -PathType Leaf) {
  $runbook = Get-Content -LiteralPath $runbookPath -Raw
  $taskMatches = [regex]::Matches($runbook, '(?m)^#### (WP\d{2}-T\d{2}) — .+$')
  if ($taskMatches.Count -eq 0) {
    Add-Failure 'The execution runbook contains no atomic WPXX-TYY task headings.'
  }

  $taskIds = @($taskMatches | ForEach-Object { $_.Groups[1].Value })
  foreach ($duplicate in $taskIds | Group-Object | Where-Object Count -gt 1) {
    Add-Failure "Duplicate runbook task ID: $($duplicate.Name)"
  }

  for ($index = 0; $index -lt $taskMatches.Count; $index++) {
    $start = $taskMatches[$index].Index
    $end = if ($index + 1 -lt $taskMatches.Count) { $taskMatches[$index + 1].Index } else { $runbook.Length }
    $taskBlock = $runbook.Substring($start, $end - $start)
    if ($taskBlock -notmatch '(?m)^- \[[ ~?!x]\] .+$') {
      Add-Failure "Runbook task lacks acceptance checklist items: $($taskIds[$index])"
    }
  }

  if ($runbook -cmatch 'docs/decisions/[A-Z]') {
    Add-Failure 'The runbook contains an uppercase decision filename; use lowercase filenames and uppercase IDs in content.'
  }
}

$taskTemplatePath = Join-Path $projectRoot 'docs/templates/task-record.md'
if (Test-Path -LiteralPath $taskTemplatePath -PathType Leaf) {
  $taskTemplate = Get-Content -LiteralPath $taskTemplatePath -Raw
  $requiredTaskFields = @(
    'Task ID'
    'Status'
    'Outcome'
    'Owner'
    'Reviewer'
    'Branch'
    'Dependencies'
    'Inputs'
    'Files'
    'Verify'
    'Pass'
    'Evidence'
    'Rollback'
    'Hard stop'
    'Changed'
    'Commands'
    'Remaining'
    'Next safe action'
    'Reviewer action'
  )

  foreach ($field in $requiredTaskFields) {
    if ($taskTemplate -notmatch "(?m)^\*\*$([regex]::Escape($field)):\*\*") {
      Add-Failure "Task-record template lacks required field: $field"
    }
  }
}

$taskRecordRoot = Join-Path $projectRoot 'planning/tasks'
if (Test-Path -LiteralPath $taskRecordRoot -PathType Container) {
  foreach ($taskRecordFile in Get-ChildItem -LiteralPath $taskRecordRoot -File -Filter '*.md') {
    $taskRecord = Get-Content -LiteralPath $taskRecordFile.FullName -Raw
    foreach ($field in $requiredTaskFields) {
      if ($taskRecord -notmatch "(?m)^\*\*$([regex]::Escape($field)):\*\*") {
        $relativePath = [System.IO.Path]::GetRelativePath($projectRoot, $taskRecordFile.FullName).Replace('\', '/')
        Add-Failure "Task record $relativePath lacks required field: $field"
      }
    }
  }
}

$decisionRegisterPath = Join-Path $projectRoot 'planning/decision-register.md'
if (Test-Path -LiteralPath $decisionRegisterPath -PathType Leaf) {
  $decisionRegister = Get-Content -LiteralPath $decisionRegisterPath -Raw
  $decisionRows = [regex]::Matches($decisionRegister, '(?m)^\| (D-\d{2}) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| (Open|Proposed|Approved direction) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$')
  $decisionIds = @($decisionRows | ForEach-Object { $_.Groups[1].Value })

  foreach ($expectedNumber in 1..21) {
    $expectedId = 'D-{0:D2}' -f $expectedNumber
    if ($decisionIds -notcontains $expectedId) {
      Add-Failure "Decision register is missing $expectedId."
    }
  }

  foreach ($duplicate in $decisionIds | Group-Object | Where-Object Count -gt 1) {
    Add-Failure "Duplicate decision-register ID: $($duplicate.Name)"
  }

  foreach ($row in $decisionRows) {
    $status = $row.Groups[5].Value
    $resolutionPath = $row.Groups[7].Value
    $blocks = $row.Groups[8].Value
    $record = $row.Groups[6].Value
    if ($status -in @('Open', 'Proposed') -and $blocks -notmatch 'WP\d{2}-T\d{2}') {
      Add-Failure "Open decision $($row.Groups[1].Value) does not name an exact blocked task."
    }
    if ($status -in @('Open', 'Proposed') -and $resolutionPath -notmatch 'WP\d{2}-T\d{2}') {
      Add-Failure "Open decision $($row.Groups[1].Value) does not name an exact resolution task."
    }

    $resolutionTaskIds = @([regex]::Matches($resolutionPath, 'WP\d{2}-T\d{2}') | ForEach-Object Value)
    $blockedTaskIds = @([regex]::Matches($blocks, 'WP\d{2}-T\d{2}') | ForEach-Object Value)
    foreach ($resolutionTaskId in $resolutionTaskIds) {
      if ($taskIds -notcontains $resolutionTaskId) {
        Add-Failure "Decision $($row.Groups[1].Value) names an unknown resolution task: $resolutionTaskId"
      }
      if ($blockedTaskIds -contains $resolutionTaskId) {
        Add-Failure "Decision $($row.Groups[1].Value) blocks its own resolution task: $resolutionTaskId"
      }
    }
    foreach ($blockedTaskId in $blockedTaskIds) {
      if ($taskIds -notcontains $blockedTaskId) {
        Add-Failure "Decision $($row.Groups[1].Value) names an unknown blocked task: $blockedTaskId"
      }
    }

    $recordPathMatch = [regex]::Match($record, '`(?<path>docs/decisions/[a-z0-9-]+\.md)`')
    if ($recordPathMatch.Success -and $record -notmatch '\(missing\)') {
      $recordPath = Join-Path $projectRoot $recordPathMatch.Groups['path'].Value
      if (-not (Test-Path -LiteralPath $recordPath -PathType Leaf)) {
        Add-Failure "Decision $($row.Groups[1].Value) points to a missing record: $($recordPathMatch.Groups['path'].Value)"
      } else {
        $recordContent = Get-Content -LiteralPath $recordPath -Raw
        $recordStatusMatch = [regex]::Match($recordContent, '(?m)^\*\*Status:\*\*\s*(OPEN|PROPOSED|APPROVED|REJECTED|SUPERSEDED)$')
        if (-not $recordStatusMatch.Success) {
          Add-Failure "Decision record has no valid explicit status: $($recordPathMatch.Groups['path'].Value)"
        } else {
          $expectedRecordStatus = if ($status -eq 'Approved direction') { 'APPROVED' } else { $status.ToUpperInvariant() }
          if ($recordStatusMatch.Groups[1].Value -cne $expectedRecordStatus) {
          Add-Failure "Decision status differs between register and record for $($row.Groups[1].Value)."
          }
        }
      }
    }
  }

  $masterPlanPath = Join-Path $projectRoot 'docs/plans/poc-master-plan.md'
  $masterPlan = Get-Content -LiteralPath $masterPlanPath -Raw
  $masterPlanDecisionRows = [regex]::Matches($masterPlan, '(?m)^\| (D-\d{2}) \| [^|]+ \| [^|]+ \| [^|]+ \| (?:Open|Proposed|Approved direction) \|$')
  $masterPlanDecisionIds = @($masterPlanDecisionRows | ForEach-Object { $_.Groups[1].Value })

  foreach ($duplicate in $masterPlanDecisionIds | Group-Object | Where-Object Count -gt 1) {
    Add-Failure "Duplicate master-plan decision ID: $($duplicate.Name)"
  }

  $decisionSetDifference = @(Compare-Object -ReferenceObject $masterPlanDecisionIds -DifferenceObject $decisionIds)
  foreach ($difference in $decisionSetDifference) {
    Add-Failure "Decision ID differs between master plan and register: $($difference.InputObject) ($($difference.SideIndicator))"
  }
}

$workStateScriptPath = Join-Path $projectRoot 'scripts/show-work-state.ps1'
if (Test-Path -LiteralPath $workStateScriptPath -PathType Leaf) {
  try {
    $workStateJson = & $workStateScriptPath -Format Json
    if ($LASTEXITCODE -ne 0) {
      Add-Failure "Work-state command exited $LASTEXITCODE."
    } else {
      $workState = $workStateJson | ConvertFrom-Json -Depth 8
      if ($null -ne $workState.recommendedTask) {
        $knownTaskIds = @($taskMatches | ForEach-Object { $_.Groups[1].Value })
        if ($knownTaskIds -notcontains $workState.recommendedTask.taskId) {
          Add-Failure "Work-state command recommended an unknown task: $($workState.recommendedTask.taskId)"
        }
        if ($workState.recommendedTask.status -notin @('NOT_STARTED', 'IN_PROGRESS')) {
          Add-Failure "Work-state command recommended a non-executable status: $($workState.recommendedTask.status)"
        }
        if (@($workState.blockedTaskIds) -contains $workState.recommendedTask.taskId) {
          Add-Failure "Work-state command recommended a decision-blocked task: $($workState.recommendedTask.taskId)"
        }
        $blockedRecordIds = @($workState.activeTaskRecords | Where-Object status -in @('BLOCKED', 'FAILED') | ForEach-Object taskId)
        if ($blockedRecordIds -contains $workState.recommendedTask.taskId) {
          Add-Failure "Work-state command recommended a blocked task record: $($workState.recommendedTask.taskId)"
        }
      }
    }
  } catch {
    Add-Failure "Work-state command failed validation: $($_.Exception.Message)"
  }
}

if ($failures.Count -gt 0) {
  Write-Error ("Agent-readiness verification failed:`n- " + ($failures -join "`n- "))
  exit 1
}

Write-Host "Agent-readiness verification passed: $checkedNames names, $checkedLinks local links, $($decisionIds.Count) synchronized decisions, and $($taskMatches.Count) task contracts checked."
