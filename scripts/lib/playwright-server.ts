import { execFileSync, spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export const PLAYWRIGHT_SERVER_PORT = 3100;
export const PLAYWRIGHT_SERVER_HOST = "127.0.0.1";
const lockFileName = "playwright-server.json";

type ServerLock = Readonly<{
  pid: number;
  port: number;
  projectRoot: string;
}>;

function normalize(value: string): string {
  return value
    .replaceAll("\\", "/")
    .replaceAll('"', "")
    .replaceAll("'", "")
    .toLowerCase();
}

export function isTaskOwnedPlaywrightCommand(
  commandLine: string,
  projectRoot: string,
  port = PLAYWRIGHT_SERVER_PORT,
): boolean {
  const command = normalize(commandLine);
  const root = normalize(projectRoot).replace(/\/$/u, "");
  return (
    command.includes(root) &&
    /(?:next(?:\.cmd)?\s+dev|next\/dist\/bin\/next\s+dev)/u.test(command) &&
    command.includes(`--hostname ${PLAYWRIGHT_SERVER_HOST}`) &&
    command.includes(`--port ${String(port)}`)
  );
}

function lockPath(projectRoot: string): string {
  return path.join(projectRoot, "test-results", "e2e", lockFileName);
}

function readLock(projectRoot: string): ServerLock | undefined {
  const filePath = lockPath(projectRoot);
  if (!existsSync(filePath)) return undefined;
  try {
    const value = JSON.parse(
      readFileSync(filePath, "utf8"),
    ) as Partial<ServerLock>;
    if (
      typeof value.pid !== "number" ||
      !Number.isInteger(value.pid) ||
      value.pid <= 0 ||
      value.port !== PLAYWRIGHT_SERVER_PORT ||
      value.projectRoot !== projectRoot
    ) {
      return undefined;
    }
    return value as ServerLock;
  } catch {
    return undefined;
  }
}

function removeLock(projectRoot: string): void {
  try {
    unlinkSync(lockPath(projectRoot));
  } catch {
    // A missing lock is already clean.
  }
}

function processExists(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function listeningPids(port: number): number[] {
  try {
    const output =
      process.platform === "win32"
        ? execFileSync(
            "powershell.exe",
            [
              "-NoProfile",
              "-Command",
              `Get-NetTCPConnection -LocalPort ${String(port)} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess`,
            ],
            { encoding: "utf8", windowsHide: true },
          )
        : execFileSync(
            "lsof",
            ["-nP", `-iTCP:${String(port)}`, "-sTCP:LISTEN", "-t"],
            { encoding: "utf8", windowsHide: true },
          );
    return Array.from(
      new Set(
        output
          .split(/\r?\n/u)
          .map((line) => Number.parseInt(line.trim(), 10))
          .filter((pid) => Number.isInteger(pid) && pid > 0),
      ),
    );
  } catch {
    return [];
  }
}

function processCommandLine(pid: number): string {
  try {
    if (process.platform === "win32") {
      return execFileSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `Get-CimInstance Win32_Process -Filter \"ProcessId = ${String(pid)}\" | Select-Object -ExpandProperty CommandLine`,
        ],
        { encoding: "utf8", windowsHide: true },
      ).trim();
    }
    return execFileSync("ps", ["-p", String(pid), "-o", "command="], {
      encoding: "utf8",
      windowsHide: true,
    }).trim();
  } catch {
    return "";
  }
}

function isExpectedPlaywrightCommand(
  commandLine: string,
  port = PLAYWRIGHT_SERVER_PORT,
): boolean {
  const command = normalize(commandLine);
  return (
    /(?:next(?:\.cmd)?\s+dev|next\/dist\/bin\/next\s+dev)/u.test(command) &&
    command.includes(`--hostname ${PLAYWRIGHT_SERVER_HOST}`) &&
    command.includes(`--port ${String(port)}`)
  );
}

function terminateProcessTree(pid: number): void {
  try {
    if (process.platform === "win32") {
      execFileSync("taskkill.exe", ["/PID", String(pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
      return;
    }
    try {
      process.kill(-pid, "SIGTERM");
    } catch {
      process.kill(pid, "SIGTERM");
    }
  } catch {
    // The process may have exited between discovery and cleanup.
  }
}

export function cleanupKnownStalePlaywrightServers(projectRoot: string): void {
  const lock = readLock(projectRoot);
  const candidatePids = new Set<number>(listeningPids(PLAYWRIGHT_SERVER_PORT));
  if (lock !== undefined) candidatePids.add(lock.pid);

  for (const pid of candidatePids) {
    if (pid === process.pid || !processExists(pid)) continue;
    const commandLine = processCommandLine(pid);
    const isLockedProcess = lock?.pid === pid;
    if (
      isTaskOwnedPlaywrightCommand(commandLine, projectRoot) ||
      (isLockedProcess && isExpectedPlaywrightCommand(commandLine))
    ) {
      terminateProcessTree(pid);
    }
  }
  removeLock(projectRoot);
}

export async function runOwnedPlaywrightServer(
  projectRoot = process.cwd(),
): Promise<number> {
  cleanupKnownStalePlaywrightServers(projectRoot);
  const resultDirectory = path.join(projectRoot, "test-results", "e2e");
  mkdirSync(resultDirectory, { recursive: true });

  const isWindows = process.platform === "win32";
  const command = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "corepack";
  const arguments_ = isWindows
    ? [
        "/d",
        "/s",
        "/c",
        `corepack.cmd pnpm next dev --hostname ${PLAYWRIGHT_SERVER_HOST} --port ${String(PLAYWRIGHT_SERVER_PORT)}`,
      ]
    : [
        "pnpm",
        "next",
        "dev",
        "--hostname",
        PLAYWRIGHT_SERVER_HOST,
        "--port",
        String(PLAYWRIGHT_SERVER_PORT),
      ];
  const child = spawn(command, arguments_, {
    cwd: projectRoot,
    env: { ...process.env, UNIMIND_PLAYWRIGHT_SERVER: "1" },
    stdio: "inherit",
    windowsHide: true,
    detached: !isWindows,
  });
  if (child.pid === undefined) {
    throw new Error("Unable to start the owned Playwright test server.");
  }

  writeFileSync(
    lockPath(projectRoot),
    `${JSON.stringify({ pid: child.pid, port: PLAYWRIGHT_SERVER_PORT, projectRoot }, null, 2)}\n`,
    "utf8",
  );

  let stopping = false;
  const stop = (): void => {
    if (stopping) return;
    stopping = true;
    terminateProcessTree(child.pid as number);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  return await new Promise<number>((resolve) => {
    child.once("exit", (code, signal) => {
      removeLock(projectRoot);
      process.removeListener("SIGINT", stop);
      process.removeListener("SIGTERM", stop);
      resolve(code ?? (signal === null ? 1 : 1));
    });
    child.once("error", () => {
      removeLock(projectRoot);
      process.removeListener("SIGINT", stop);
      process.removeListener("SIGTERM", stop);
      resolve(1);
    });
  });
}
