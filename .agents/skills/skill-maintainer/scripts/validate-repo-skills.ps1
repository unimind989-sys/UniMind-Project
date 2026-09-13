[CmdletBinding()]
param(
    [string]$SkillsRoot,
    [switch]$SkipNodeSyntax
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir '../../../..')).Path

if (-not $SkillsRoot) {
    $SkillsRoot = Join-Path $repoRoot '.agents/skills'
}

$SkillsRoot = (Resolve-Path $SkillsRoot).Path
$validator = Join-Path $env:USERPROFILE '.codex/skills/.system/skill-creator/scripts/quick_validate.py'

if (-not (Test-Path -LiteralPath $validator -PathType Leaf)) {
    throw "Codex skill validator not found: $validator"
}

$python = Get-Command python -ErrorAction Stop
$dependencyRoot = Join-Path ([IO.Path]::GetTempPath()) 'unimind-codex-skill-validator-pyyaml-6.0.2'
$dependencyModule = Join-Path $dependencyRoot 'yaml'
$needsDependencyInstall = -not (Test-Path -LiteralPath $dependencyModule -PathType Container)

if (-not $needsDependencyInstall) {
    $previousDependencyCheckPath = $env:PYTHONPATH
    try {
        $env:PYTHONPATH = $dependencyRoot
        & $python.Source -c "import sys, yaml; sys.exit(0 if callable(getattr(yaml, 'safe_load', None)) and hasattr(yaml, 'YAMLError') else 1)" 2>$null
        $needsDependencyInstall = $LASTEXITCODE -ne 0
    } finally {
        $env:PYTHONPATH = $previousDependencyCheckPath
    }
}

if ($needsDependencyInstall) {
    New-Item -ItemType Directory -Path $dependencyRoot -Force | Out-Null
    & $python.Source -m pip install 'PyYAML==6.0.2' --target $dependencyRoot --upgrade --force-reinstall --disable-pip-version-check --no-warn-script-location
    if ($LASTEXITCODE -ne 0) {
        throw 'Failed to install the temporary PyYAML validator dependency.'
    }
}

$previousPythonPath = $env:PYTHONPATH
$previousUtf8 = $env:PYTHONUTF8
$env:PYTHONPATH = if ($previousPythonPath) { "$dependencyRoot;$previousPythonPath" } else { $dependencyRoot }
$env:PYTHONUTF8 = '1'

$failures = [System.Collections.Generic.List[string]]::new()
$skillDirs = Get-ChildItem -LiteralPath $SkillsRoot -Directory | Where-Object {
    Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') -PathType Leaf
}

try {
    foreach ($skillDir in $skillDirs) {
        & $python.Source $validator $skillDir.FullName
        if ($LASTEXITCODE -ne 0) {
            $failures.Add("Official validation failed: $($skillDir.Name)")
        }
    }
} finally {
    $env:PYTHONPATH = $previousPythonPath
    $env:PYTHONUTF8 = $previousUtf8
}

$names = @{}
foreach ($skillDir in $skillDirs) {
    $skillFile = Join-Path $skillDir.FullName 'SKILL.md'
    $content = Get-Content -LiteralPath $skillFile -Raw

    if ($content -match '(?m)^name:\s*[''\"]?([^''\"\r\n]+)') {
        $name = $Matches[1].Trim()
        if ($names.ContainsKey($name)) {
            $failures.Add("Duplicate skill name '$name': $($names[$name]) and $skillFile")
        } else {
            $names[$name] = $skillFile
        }
    }

    if ($content -match '(?m)^disable-model-invocation\s*:') {
        $failures.Add("Unsupported disable-model-invocation frontmatter: $skillFile")
    }

    Get-ChildItem -LiteralPath $skillDir.FullName -Recurse -Filter '*.md' -File | ForEach-Object {
        $markdownFile = $_.FullName
        $markdown = Get-Content -LiteralPath $markdownFile -Raw

        if ($markdown -match '(?i)call the skill tool') {
            $failures.Add("Unsupported generic Skill tool call: $markdownFile")
        }

        $links = [regex]::Matches($markdown, '\[[^\]]+\]\(([^)]+\.md(?:#[^)]+)?)\)')
        foreach ($link in $links) {
            $target = $link.Groups[1].Value -replace '#.*$', ''
            if ($target -match '^(?:https?://|mailto:)') {
                continue
            }

            $resolved = Join-Path $_.DirectoryName $target
            if (-not (Test-Path -LiteralPath $resolved -PathType Leaf)) {
                $failures.Add("Broken Markdown reference in $markdownFile -> $target")
            }
        }
    }

    $metadataFile = Join-Path $skillDir.FullName 'agents/openai.yaml'
    if (Test-Path -LiteralPath $metadataFile -PathType Leaf) {
        $metadata = Get-Content -LiteralPath $metadataFile -Raw
        if ($metadata -match 'allow_implicit_invocation:\s*(\S+)' -and $Matches[1] -notin @('true', 'false')) {
            $failures.Add("Invalid allow_implicit_invocation value: $metadataFile")
        }
    }
}

Get-ChildItem -LiteralPath $SkillsRoot -Recurse -Filter '*.json' -File | ForEach-Object {
    try {
        Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json | Out-Null
    } catch {
        $failures.Add("Invalid JSON: $($_.FullName): $($_.Exception.Message)")
    }
}

if (-not $SkipNodeSyntax) {
    $node = Get-Command node -ErrorAction Stop
    Get-ChildItem -LiteralPath $SkillsRoot -Recurse -File | Where-Object {
        $_.Extension -in @('.js', '.mjs', '.cjs')
    } | ForEach-Object {
        & $node.Source --check $_.FullName 2>$null
        if ($LASTEXITCODE -ne 0) {
            $failures.Add("Node syntax check failed: $($_.FullName)")
        }
    }
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ -ErrorAction Continue }
    throw "Skill validation failed with $($failures.Count) issue(s)."
}

Write-Host "Validated $($skillDirs.Count) skills, local Markdown references, JSON files, invocation syntax, and script syntax."
