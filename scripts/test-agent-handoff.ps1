[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$sourceWorkStateScript = Join-Path $projectRoot 'scripts/show-work-state.ps1'
$sourceWorkStateOutput = @(& pwsh -NoProfile -File $sourceWorkStateScript -Format Json)
if ($LASTEXITCODE -ne 0) {
  throw "Source work-state command failed with exit code $LASTEXITCODE."
}
$sourceWorkState = ($sourceWorkStateOutput -join [Environment]::NewLine) | ConvertFrom-Json -Depth 8
$expectedWorkPackage = $sourceWorkState.currentWorkPackage
$expectedTaskId = $sourceWorkState.recommendedTask.taskId
$tempBase = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$rehearsalName = 'unimind-agent-handoff-{0}' -f ([guid]::NewGuid().ToString('N'))
$rehearsalPath = [System.IO.Path]::GetFullPath((Join-Path $tempBase $rehearsalName))
$expectedPrefix = $tempBase.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar

if (-not $rehearsalPath.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing rehearsal outside the system temp directory: $rehearsalPath"
}
if ([System.IO.Path]::GetFileName($rehearsalPath) -notlike 'unimind-agent-handoff-*') {
  throw "Refusing unexpected rehearsal directory name: $rehearsalPath"
}

$trackedFiles = @(& git -C $projectRoot ls-files)
if ($LASTEXITCODE -ne 0) {
  throw "Unable to enumerate the committed snapshot with git ls-files."
}
if ($trackedFiles.Count -eq 0) {
  throw 'Committed snapshot contains no tracked files.'
}
$trackedFiles = @($trackedFiles + @($sourceWorkState.activeTaskRecords | Where-Object status -eq 'IN_PROGRESS' | ForEach-Object taskRecordPath) | Sort-Object -Unique)

try {
  [void](New-Item -ItemType Directory -Path $rehearsalPath)

  foreach ($relativePath in $trackedFiles) {
    $sourcePath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path -LiteralPath $sourcePath)) {
      throw "Rehearsal source is missing: $relativePath"
    }

    $destinationPath = Join-Path $rehearsalPath $relativePath
    $destinationDirectory = Split-Path -Parent $destinationPath
    if (-not (Test-Path -LiteralPath $destinationDirectory)) {
      [void](New-Item -ItemType Directory -Path $destinationDirectory -Force)
    }
    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath
  }

  $gitInitOutput = @(& git -C $rehearsalPath init --quiet 2>&1)
  if ($LASTEXITCODE -ne 0) {
    throw "Temporary git init failed with exit code $LASTEXITCODE`: $($gitInitOutput -join ' ')"
  }
  $gitAddOutput = @(& git -C $rehearsalPath add --all 2>&1)
  if ($LASTEXITCODE -ne 0) {
    throw "Temporary git add failed with exit code $LASTEXITCODE`: $($gitAddOutput -join ' ')"
  }
  $gitCommitOutput = @(& git -C $rehearsalPath -c user.name='UniMind Rehearsal' -c user.email='rehearsal@invalid.example' commit --quiet -m 'test: isolated agent handoff snapshot' 2>&1)
  if ($LASTEXITCODE -ne 0) {
    throw "Temporary git commit failed with exit code $LASTEXITCODE`: $($gitCommitOutput -join ' ')"
  }

  $workStateScript = Join-Path $rehearsalPath 'scripts/show-work-state.ps1'
  $readinessScript = Join-Path $rehearsalPath 'scripts/verify-agent-readiness.ps1'

  $workStateOutput = @(& pwsh -NoProfile -File $workStateScript -Format Json)
  if ($LASTEXITCODE -ne 0) {
    throw "Isolated work-state command failed with exit code $LASTEXITCODE."
  }
  $workState = ($workStateOutput -join [Environment]::NewLine) | ConvertFrom-Json -Depth 8

  if ($workState.currentWorkPackage -cne $expectedWorkPackage) {
    throw "Isolated work package differs from source: expected $expectedWorkPackage, got $($workState.currentWorkPackage)"
  }
  if ($workState.recommendedTask.taskId -cne $expectedTaskId) {
    throw "Isolated recommendation differs from source: expected $expectedTaskId, got $($workState.recommendedTask.taskId)"
  }
  if ($null -ne $workState.recommendedTask -and @($workState.blockedTaskIds) -contains $workState.recommendedTask.taskId) {
    throw "Isolated recommendation is decision-blocked: $($workState.recommendedTask.taskId)"
  }
  if (@($workState.activeTaskRecords).Count -eq 0) {
    throw 'Isolated work state contains no durable active task record.'
  }
  foreach ($taskRecord in @($workState.activeTaskRecords)) {
    if ([string]::IsNullOrWhiteSpace($taskRecord.nextSafeAction)) {
      throw "Isolated task record lacks a next safe action: $($taskRecord.taskId)"
    }
    if ([int]$taskRecord.routing.policyVersion -ge 6 -and $taskRecord.status -eq 'IN_PROGRESS') {
      if ([string]::IsNullOrWhiteSpace($taskRecord.taskRecordPath) -or [string]::IsNullOrWhiteSpace($taskRecord.remaining) -or $null -eq $taskRecord.preparation) {
        throw "Isolated policy-v6 task lacks bounded recovery state: $($taskRecord.taskId)"
      }
      foreach ($fact in @($taskRecord.establishedFacts)) {
        if ($fact.status -notin @('CURRENT', 'STALE', 'MISSING')) { throw "Isolated fact has invalid source state: $($taskRecord.taskId)" }
      }
    }
  }

  $readinessOutput = @(& pwsh -NoProfile -File $readinessScript 2>&1)
  if ($LASTEXITCODE -ne 0) {
    throw "Isolated readiness command failed with exit code $LASTEXITCODE`: $($readinessOutput -join ' ')"
  }

  $gitStatus = @(& git -C $rehearsalPath status --short)
  if ($LASTEXITCODE -ne 0) {
    throw "Isolated git status failed with exit code $LASTEXITCODE."
  }
  if ($gitStatus.Count -ne 0) {
    throw "Rehearsal commands modified the isolated repository: $($gitStatus -join ', ')"
  }

  $v6Record = @($workState.activeTaskRecords | Where-Object { $_.status -eq 'IN_PROGRESS' -and [int]$_.routing.policyVersion -ge 6 } | Select-Object -First 1)
  if ($v6Record.Count -gt 0) {
    $recordPath = Join-Path $rehearsalPath $v6Record[0].taskRecordPath
    $productPath = Join-Path $rehearsalPath 'PRODUCT.md'
    $productHash = (& git -C $rehearsalPath hash-object -- $productPath | Select-Object -First 1).Trim()
    $recordText = Get-Content -LiteralPath $recordPath -Raw
    $syntheticFact = "Fact requiring product authority | PRODUCT.md#Product | $productHash | when product scope changes"
    $recordText = [regex]::Replace($recordText, '(?m)^\*\*Established facts:\*\* .+$', "**Established facts:** $syntheticFact")
    Set-Content -LiteralPath $recordPath -Value $recordText -NoNewline
    $currentState = (@(& pwsh -NoProfile -File $workStateScript -Format Json) -join [Environment]::NewLine) | ConvertFrom-Json -Depth 9
    $currentFact = @($currentState.activeTaskRecords | Where-Object taskId -eq $v6Record[0].taskId)[0].establishedFacts[0]
    if ($currentFact.status -cne 'CURRENT') { throw 'Isolated source-bound fact should be CURRENT.' }
    Add-Content -LiteralPath $productPath -Value "`nSynthetic handoff drift."
    $staleState = (@(& pwsh -NoProfile -File $workStateScript -Format Json) -join [Environment]::NewLine) | ConvertFrom-Json -Depth 9
    $staleFact = @($staleState.activeTaskRecords | Where-Object taskId -eq $v6Record[0].taskId)[0].establishedFacts[0]
    if ($staleFact.status -cne 'STALE') { throw 'Changed source must make an established fact STALE.' }
    Remove-Item -LiteralPath $productPath
    $missingState = (@(& pwsh -NoProfile -File $workStateScript -Format Json) -join [Environment]::NewLine) | ConvertFrom-Json -Depth 9
    $missingFact = @($missingState.activeTaskRecords | Where-Object taskId -eq $v6Record[0].taskId)[0].establishedFacts[0]
    if ($missingFact.status -cne 'MISSING') { throw 'Missing source must require reopening.' }
  }

  if ($expectedTaskId -ceq 'WP00-T09') {
    $runbookPath = Join-Path $rehearsalPath 'docs/runbooks/poc-execution-runbook.md'
    $taskRecordPath = Join-Path $rehearsalPath 'planning/tasks/wp00-t09-autonomous-agent-execution.md'
    $runbook = Get-Content -LiteralPath $runbookPath -Raw
    $taskRecord = Get-Content -LiteralPath $taskRecordPath -Raw
    $taskBlockPattern = '(?ms)(^#### WP00-T09 —.*?)(?=^#### |^### )'
    $taskBlockMatch = [regex]::Match($runbook, $taskBlockPattern)
    if (-not $taskBlockMatch.Success) {
      throw 'Unable to locate WP00-T09 in the isolated runbook.'
    }

    $completedTaskBlock = [regex]::Replace($taskBlockMatch.Value, '(?m)^- \[[ ~?!]\]', '- [x]')
    $runbook = $runbook.Remove($taskBlockMatch.Index, $taskBlockMatch.Length).Insert($taskBlockMatch.Index, $completedTaskBlock)
    $taskRecord = [regex]::Replace($taskRecord, '(?m)^\*\*Status:\*\* \[[ ~?!]\]$', '**Status:** [x]', 1)
    $taskRecord = [regex]::Replace($taskRecord, '(?m)^- \[[ ~?!]\]', '- [x]')
    Set-Content -LiteralPath $runbookPath -Value $runbook -NoNewline
    Set-Content -LiteralPath $taskRecordPath -Value $taskRecord -NoNewline

    $postCompletionOutput = @(& pwsh -NoProfile -File $workStateScript -Format Json)
    if ($LASTEXITCODE -ne 0) {
      throw "Post-completion work-state command failed with exit code $LASTEXITCODE."
    }
    $postCompletionState = ($postCompletionOutput -join [Environment]::NewLine) | ConvertFrom-Json -Depth 8
    if ($postCompletionState.currentWorkPackage -cne 'WP03' -or $postCompletionState.recommendedTask.taskId -cne 'WP03-T04') {
      throw "Completing WP00-T09 must return selection to WP03-T04; got $($postCompletionState.currentWorkPackage)/$($postCompletionState.recommendedTask.taskId)."
    }
  }

  $displayRecommendation = if ($null -eq $workState.recommendedTask) { 'no eligible task' } else { "$($workState.recommendedTask.taskId) recommendation" }
  $completionProof = if ($expectedTaskId -ceq 'WP00-T09') { ', plus deterministic WP03-T04 selection after simulated WP00-T09 closure' } else { '' }
  Write-Output "Agent handoff rehearsal passed: isolated committed snapshot, clean worktree, $displayRecommendation, $(@($workState.activeTaskRecords).Count) durable active records, readiness verification$completionProof."
} finally {
  if (Test-Path -LiteralPath $rehearsalPath) {
    $resolvedRemovalPath = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $rehearsalPath).Path)
    $safePrefix = $tempBase.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
    $safeName = [System.IO.Path]::GetFileName($resolvedRemovalPath) -like 'unimind-agent-handoff-*'
    if (-not $resolvedRemovalPath.StartsWith($safePrefix, [System.StringComparison]::OrdinalIgnoreCase) -or -not $safeName) {
      throw "Refusing to remove unverified rehearsal path: $resolvedRemovalPath"
    }
    Remove-Item -LiteralPath $resolvedRemovalPath -Recurse -Force
  }
}
