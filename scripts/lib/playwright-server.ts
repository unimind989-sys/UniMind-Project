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

export function resolvePlaywrightServerPort(value: string | undefined): number {
  if (value === undefined) return PLAYWRIGHT_SERVER_PORT;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("UNIMIND_E2E_PORT must be an integer from 1024 to 65535.");
  }
  return port;
}

type ServerLock = Readonly<{
  pid: number;
  port: number;
  projectRoot: string;
  detached?: boolean;
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

function lockPath(projectRoot: string, port: number): string {
  const name =
    port === PLAYWRIGHT_SERVER_PORT
      ? lockFileName
      : `playwright-server-${String(port)}.json`;
  return path.join(projectRoot, "test-results", "e2e", name);
}

function readLock(projectRoot: string, port: number): ServerLock | undefined {
  const filePath = lockPath(projectRoot, port);
  if (!existsSync(filePath)) return undefined;
  try {
    const value = JSON.parse(
      readFileSync(filePath, "utf8"),
    ) as Partial<ServerLock>;
    if (
      typeof value.pid !== "number" ||
      !Number.isInteger(value.pid) ||
      value.pid <= 0 ||
      value.port !== port ||
      value.projectRoot !== projectRoot
    ) {
      return undefined;
    }
    return value as ServerLock;
  } catch {
    return undefined;
  }
}

function removeLock(projectRoot: string, port: number): void {
  try {
    unlinkSync(lockPath(projectRoot, port));
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

function processTreePids(rootPid: number): number[] {
  try {
    const output = execFileSync("ps", ["-eo", "pid=,ppid="], {
      encoding: "utf8",
      windowsHide: true,
    });
    const children = new Map<number, number[]>();
    for (const line of output.split(/\r?\n/u)) {
      const match = line.trim().match(/^(\d+)\s+(\d+)$/u);
      if (match === null) continue;
      const pidText = match[1];
      const parentPidText = match[2];
      if (pidText === undefined || parentPidText === undefined) continue;
      const pid = Number.parseInt(pidText, 10);
      const parentPid = Number.parseInt(parentPidText, 10);
      const siblings = children.get(parentPid) ?? [];
      siblings.push(pid);
      children.set(parentPid, siblings);
    }

    const result: number[] = [];
    const visit = (pid: number): void => {
      for (const childPid of children.get(pid) ?? []) visit(childPid);
      result.push(pid);
    };
    visit(rootPid);
    return result;
  } catch {
    return [rootPid];
  }
}

function terminateProcessTree(pid: number, detached = false): void {
  try {
    if (process.platform === "win32") {
      execFileSync("taskkill.exe", ["/PID", String(pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
      return;
    }
    if (detached) {
      try {
        process.kill(-pid, "SIGTERM");
        return;
      } catch {
        // Fall through to the direct owned-process signal.
      }
    }
    for (const processId of processTreePids(pid)) {
      try {
        process.kill(processId, "SIGTERM");
      } catch {
        // The process may have exited between tree discovery and cleanup.
      }
    }
  } catch {
    // The process may have exited between discovery and cleanup.
  }
}

export function cleanupKnownStalePlaywrightServers(
  projectRoot: string,
  port = PLAYWRIGHT_SERVER_PORT,
): void {
  const lock = readLock(projectRoot, port);
  if (
    lock !== undefined &&
    lock.pid !== process.pid &&
    processExists(lock.pid)
  ) {
    const commandLine = processCommandLine(lock.pid);
    if (
      isTaskOwnedPlaywrightCommand(commandLine, projectRoot, port) ||
      isExpectedPlaywrightCommand(commandLine, port)
    ) {
      terminateProcessTree(lock.pid, lock.detached !== false);
    }
  }
  removeLock(projectRoot, port);
}

export async function runOwnedPlaywrightServer(
  projectRoot = process.cwd(),
): Promise<number> {
  const port = resolvePlaywrightServerPort(process.env.UNIMIND_E2E_PORT);
  cleanupKnownStalePlaywrightServers(projectRoot, port);
  const resultDirectory = path.join(projectRoot, "test-results", "e2e");
  mkdirSync(resultDirectory, { recursive: true });

  const isWindows = process.platform === "win32";
  const command = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "corepack";
  const arguments_ = isWindows
    ? [
        "/d",
        "/s",
        "/c",
        `corepack.cmd pnpm next dev --hostname ${PLAYWRIGHT_SERVER_HOST} --port ${String(port)}`,
      ]
    : [
        "pnpm",
        "next",
        "dev",
        "--hostname",
        PLAYWRIGHT_SERVER_HOST,
        "--port",
        String(port),
      ];
  const child = spawn(command, arguments_, {
    cwd: projectRoot,
    env: { ...process.env, UNIMIND_PLAYWRIGHT_SERVER: "1" },
    stdio: "inherit",
    windowsHide: true,
    detached: false,
  });
  if (child.pid === undefined) {
    throw new Error("Unable to start the owned Playwright test server.");
  }

  writeFileSync(
    lockPath(projectRoot, port),
    `${JSON.stringify({ pid: child.pid, port, projectRoot, detached: false }, null, 2)}\n`,
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
  process.once("SIGHUP", stop);

  return await new Promise<number>((resolve) => {
    child.once("exit", (code, signal) => {
      removeLock(projectRoot, port);
      process.removeListener("SIGINT", stop);
      process.removeListener("SIGTERM", stop);
      process.removeListener("SIGHUP", stop);
      resolve(code ?? (signal === null ? 1 : 1));
    });
    child.once("error", () => {
      removeLock(projectRoot, port);
      process.removeListener("SIGINT", stop);
      process.removeListener("SIGTERM", stop);
      process.removeListener("SIGHUP", stop);
      resolve(1);
    });
  });
}
