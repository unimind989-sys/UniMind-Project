import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type ForbiddenClientArtifactValue = Readonly<{
  label: string;
  value: string;
}>;

export type ClientArtifactLeak = Readonly<{
  label: string;
  file: string;
}>;

async function listFiles(directory: string): Promise<readonly string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else {
      files.push(entryPath);
    }
  }
  return files;
}

function isSerializedAppArtifact(filePath: string): boolean {
  return [".body", ".html", ".json", ".rsc", ".txt"].some((extension) =>
    filePath.endsWith(extension),
  );
}

export async function findClientArtifactLeaks(
  buildRoot: string,
  forbiddenValues: readonly ForbiddenClientArtifactValue[],
): Promise<readonly ClientArtifactLeak[]> {
  const checkedValues = forbiddenValues.filter(
    ({ label, value }) => label.length > 0 && value.length >= 8,
  );
  const staticRoot = path.join(buildRoot, "static");
  const appRoot = path.join(buildRoot, "server", "app");
  const staticFiles = await listFiles(staticRoot);
  const serializedFiles = (await listFiles(appRoot)).filter(
    isSerializedAppArtifact,
  );
  const leaks: ClientArtifactLeak[] = [];

  for (const file of [...staticFiles, ...serializedFiles]) {
    const contents = await readFile(file);
    const text = contents.toString("utf8");

    for (const forbidden of checkedValues) {
      if (text.includes(forbidden.value)) {
        leaks.push({
          label: forbidden.label,
          file: path.relative(buildRoot, file).replaceAll(path.sep, "/"),
        });
      }
    }
  }

  return leaks;
}

export async function assertClientArtifactsExcludeValues(
  buildRoot: string,
  forbiddenValues: readonly ForbiddenClientArtifactValue[],
): Promise<void> {
  const leaks = await findClientArtifactLeaks(buildRoot, forbiddenValues);
  if (leaks.length === 0) {
    return;
  }

  const locations = leaks
    .map(({ label, file }) => `${label} in ${file}`)
    .join(", ");
  throw new Error(
    `Forbidden server value reached a client artifact: ${locations}`,
  );
}
