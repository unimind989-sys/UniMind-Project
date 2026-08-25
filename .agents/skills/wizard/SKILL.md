---
name: wizard
description: User-invoked only. Generate an interactive PowerShell wizard when the user explicitly asks for the Wizard skill or a PowerShell setup wizard.
---

# Wizard

Run this workflow only when the user explicitly requests the Wizard skill or an interactive PowerShell wizard.

Create a PowerShell script that walks a human through a manual procedure one stage at a time. A wizard may open exact documentation or dashboard URLs, explain what to click, capture public or secret values, update a local `.env`, set required GitHub Actions secrets or variables, and confirm irreversible actions.

Use [template.ps1](template.ps1) as the fixed interaction library. Author only the stages below its `STAGES` marker.

## 1. Scope the manual boundary

Read the repository before asking questions. Inspect environment examples, README/setup docs, framework configuration, deployment files, and every `secrets.*` or `vars.*` reference in `.github/workflows/`.

Separate:

- steps the agent can perform directly;
- steps that require the user's signed-in browser, consent, payment choice, secret reveal, or irreversible approval.

The wizard contains only the second group. Present the ordered stages and, for each captured value, its source, destination, and secret/public classification. Get the user's confirmation before authoring.

## 2. Verify the journey

For each stage, identify the current authoritative URL and the exact visible path the user follows. Browse current official documentation when a dashboard or procedure may have changed. Never invent a page, button, command, or credential name.

The journey is ready when a new contributor could complete every stage without guessing and every value has one declared destination.

## 3. Author the PowerShell wizard

Copy `template.ps1` to the agreed scratch or `scripts/` path. Keep the library above `STAGES` byte-for-byte unless a demonstrated template defect requires a skill-maintainer change.

Use these helpers below the marker:

- `Show-WizardBanner`, `Show-WizardStage`, `Write-WizardStep`, and `Write-WizardNote`;
- `Open-SetupUrl` before asking for a dashboard value;
- `Read-PublicValue` or `Read-SecretValue` according to classification;
- `Set-DotEnvValue` for local persistence;
- `Set-GitHubSecret` only for CI secrets and `Set-GitHubVariable` only for public CI configuration;
- `Confirm-WizardAction` immediately before an irreversible step;
- `Complete-Wizard` at the end.

Never embed a real secret in the script, print it, include it in a command-line argument, or write it outside its declared destination. Confirm `.env` is ignored before the wizard writes secrets there.

Wizards are temporary by default. Commit one only when the user wants a repeatable onboarding or operating procedure.

## 4. Verify and hand off

- Parse the script with PowerShell without executing its stages.
- Run PSScriptAnalyzer when available.
- Trace every captured value to its declared destination and every GitHub name to a real workflow reference.
- Do not run the wizard end-to-end because it opens browsers and waits for human input.
- Give the exact invocation, for example `pwsh -NoProfile -File .\scripts\setup-preview.ps1`.

The wizard is complete when the script parses, every stage is concrete, secrets stay hidden, rerunning safely replaces existing values, and the user has an exact command to start it.
