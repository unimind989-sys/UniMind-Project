// Checks agent-facing docs, task records and skills: `pnpm lint:agents`.
// Skill copy parity for Claude Code is checked separately by `sync-skills.ts --check`.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { parse } from "yaml";

import { readTaskRecords, recordLineLimit } from "./status";

const root = process.cwd();
const failures: string[] = [];

function read(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function markdownFiles(directory: string, exclude: RegExp[] = []): string[] {
  const absolute = path.join(root, directory);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { recursive: true, encoding: "utf8" })
    .map((entry) => `${directory}/${entry.replaceAll("\\", "/")}`)
    .filter(
      (file) =>
        file.endsWith(".md") &&
        statSync(path.join(root, file)).isFile() &&
        !exclude.some((pattern) => pattern.test(file)),
    );
}

const activeRecords = readTaskRecords(root).filter(
  (record) => record.status !== "[x]",
);
const skillDirectories = readdirSync(path.join(root, ".agents/skills"), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// 1. Relative links in agent-facing and authority documents resolve.
const linkedFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "CONTRIBUTING.md",
  "CONTEXT.md",
  "DESIGN.md",
  "PRODUCT.md",
  ".agents/skills/README.md",
  ...markdownFiles("docs", [/^docs\/reviews\//u]),
  ...skillDirectories.map((name) => `.agents/skills/${name}/SKILL.md`),
  ...activeRecords.map((record) => record.file),
].filter((file) => existsSync(path.join(root, file)));

export function relativeLinks(markdown: string): string[] {
  const withoutCode = markdown
    .replace(/```[\s\S]*?```/gu, "")
    .replace(/`[^`\n]*`/gu, "");
  const links: string[] = [];
  for (const match of withoutCode.matchAll(
    /\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/gu,
  )) {
    const target = match[1]!;
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/iu.test(target)) continue;
    links.push(decodeURI(target.split("#")[0]!.split("?")[0]!));
  }
  return links;
}

for (const file of linkedFiles) {
  for (const target of relativeLinks(read(file))) {
    if (target.length === 0) continue;
    const resolved = target.startsWith("/")
      ? path.join(root, target)
      : path.join(root, path.dirname(file), target);
    if (!existsSync(resolved)) failures.push(`${file}: broken link ${target}`);
  }
}

// 2. Active task records are short current-state records.
for (const record of activeRecords) {
  if (record.lines > recordLineLimit)
    failures.push(
      `${record.file}: ${record.lines} lines; active records must stay at or under ${recordLineLimit}`,
    );
  const text = read(record.file);
  for (const field of ["Task ID", "Status", "Outcome"])
    if (!text.includes(`**${field}:**`))
      failures.push(`${record.file}: missing **${field}:**`);
}
for (const name of readdirSync(path.join(root, "planning/tasks")))
  if (name !== "README.md" && !/^wp\d{2}-t\d{2}-[a-z0-9-]+\.md$/u.test(name))
    failures.push(
      `planning/tasks/${name}: name must be wpNN-tyy-short-outcome.md`,
    );

// 3. Shared skills are valid for Codex and Claude Code.
for (const name of skillDirectories) {
  const skillPath = `.agents/skills/${name}/SKILL.md`;
  if (!existsSync(path.join(root, skillPath))) {
    failures.push(`${skillPath}: missing`);
    continue;
  }
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(read(skillPath))?.[1];
  const metadata = frontmatter
    ? (parse(frontmatter) as Record<string, unknown>)
    : undefined;
  if (!metadata) {
    failures.push(`${skillPath}: missing frontmatter`);
    continue;
  }
  if (metadata.name !== name)
    failures.push(`${skillPath}: name must equal directory name ${name}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name) || name.length > 64)
    failures.push(
      `${skillPath}: name must be lowercase-hyphen and at most 64 characters`,
    );
  const description = metadata.description;
  if (typeof description !== "string" || description.trim().length === 0)
    failures.push(`${skillPath}: description is required`);
  else if (description.length > 1024)
    failures.push(`${skillPath}: description exceeds 1024 characters`);
  const openaiPath = `.agents/skills/${name}/agents/openai.yaml`;
  if (!existsSync(path.join(root, openaiPath))) {
    failures.push(`${openaiPath}: missing Codex invocation policy`);
    continue;
  }
  const openai = parse(read(openaiPath)) as {
    policy?: { allow_implicit_invocation?: unknown };
  };
  if (typeof openai?.policy?.allow_implicit_invocation !== "boolean")
    failures.push(
      `${openaiPath}: policy.allow_implicit_invocation must be true or false`,
    );
}

// 4. Live instructions carry no retired workflow mechanics.
const retired =
  /Sol High|Luna Max|agent:route|side browser|agent-execution-policy|show-work-state|verify-agent-readiness|model-work-blocks|proof preflight/iu;
const liveInstructions = [
  "AGENTS.md",
  "CLAUDE.md",
  "docs/templates/task-record.md",
  ".agents/skills/README.md",
  ...markdownFiles("docs/agents"),
  ...skillDirectories.map((name) => `.agents/skills/${name}/SKILL.md`),
].filter((file) => existsSync(path.join(root, file)));
for (const file of liveInstructions) {
  const match = retired.exec(read(file));
  if (match) failures.push(`${file}: retired workflow term "${match[0]}"`);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  console.error(`Agent lint failed with ${failures.length} problem(s).`);
  process.exitCode = 1;
} else {
  console.log(
    `Agent lint passed: ${linkedFiles.length} documents, ${activeRecords.length} active records, ${skillDirectories.length} skills.`,
  );
}
