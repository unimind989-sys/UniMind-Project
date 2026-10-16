import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type ModuleLayer =
  "ui" | "application" | "domain" | "adapter" | "worker" | "other";

export type BoundaryViolationCode =
  | "client-imports-server"
  | "domain-imports-framework"
  | "domain-imports-provider"
  | "domain-imports-outer-layer"
  | "application-imports-framework"
  | "application-imports-provider"
  | "application-imports-concrete-adapter"
  | "ui-imports-provider"
  | "ui-imports-inner-implementation"
  | "real-mode-imports-demo"
  | "route-imports-synthetic-runtime";

export type BoundaryViolation = Readonly<{
  code: BoundaryViolationCode;
  sourcePath: string;
  specifier: string;
  message: string;
}>;

const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const frameworkImports = ["react", "react-dom", "next"] as const;
const providerImports = [
  "@anthropic-ai/sdk",
  "@google/generative-ai",
  "@supabase/",
  "openai",
] as const;

function toPosix(filePath: string): string {
  return filePath.replaceAll(path.sep, "/");
}

function matchesPackage(specifier: string, packageName: string): boolean {
  return specifier === packageName || specifier.startsWith(`${packageName}/`);
}

function isProviderImport(specifier: string): boolean {
  return providerImports.some((packageName) =>
    packageName.endsWith("/")
      ? specifier.startsWith(packageName)
      : matchesPackage(specifier, packageName),
  );
}

function isFrameworkImport(specifier: string): boolean {
  return frameworkImports.some((packageName) =>
    matchesPackage(specifier, packageName),
  );
}

function isLayerPath(
  filePath: string,
  layer: "application" | "domain" | "adapter",
): boolean {
  const segment = layer === "adapter" ? "adapters?" : layer;
  return (
    new RegExp(`(^|/)${segment}(/|$)`).test(filePath) ||
    new RegExp(`\\.${layer}(?:\\.[cm]?[jt]sx?)?$`).test(filePath)
  );
}

export function classifyModule(filePath: string): ModuleLayer {
  const normalizedPath = toPosix(filePath);

  if (
    normalizedPath.startsWith("src/app/") ||
    normalizedPath.startsWith("src/components/")
  ) {
    return "ui";
  }
  if (normalizedPath.startsWith("workers/")) {
    return "worker";
  }
  if (isLayerPath(normalizedPath, "domain")) {
    return "domain";
  }
  if (isLayerPath(normalizedPath, "application")) {
    return "application";
  }
  if (isLayerPath(normalizedPath, "adapter")) {
    return "adapter";
  }
  return "other";
}

function collectImportSpecifiers(sourceText: string): readonly string[] {
  const specifiers = new Set<string>();
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?[^;]*?\sfrom\s*["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of sourceText.matchAll(pattern)) {
      const specifier = match[1];
      if (specifier !== undefined) {
        specifiers.add(specifier);
      }
    }
  }

  return [...specifiers];
}

function resolveInternalImport(
  sourcePath: string,
  specifier: string,
): string | undefined {
  if (specifier.startsWith("@/")) {
    return `src/${specifier.slice(2)}`;
  }
  if (specifier.startsWith(".")) {
    return path.posix.normalize(
      path.posix.join(path.posix.dirname(sourcePath), specifier),
    );
  }
  return undefined;
}

function isServerOnlyPath(filePath: string): boolean {
  if (/^src\/lib\/db\/supabase\/browser(?:\.[cm]?[jt]s)?$/.test(filePath)) {
    return false;
  }

  return (
    /(^|\/)server(\/|$)/.test(filePath) ||
    /\.server(?:\.[cm]?[jt]sx?)?$/.test(filePath) ||
    filePath.startsWith("src/lib/db/") ||
    /src\/lib\/config\/[^/]*\.server(?:\.[cm]?[jt]s)?$/.test(filePath)
  );
}

function isDemoPath(filePath: string): boolean {
  return filePath.startsWith("src/lib/demo/");
}

// Real-mode code must never reach the synthetic demo runtime. Shared UI under
// src/app may render synthetic data while the hosted runtime is mounted.
function isRealModePath(filePath: string): boolean {
  if (isDemoPath(filePath)) {
    return false;
  }
  return (
    filePath.startsWith("src/lib/") ||
    filePath.startsWith("workers/") ||
    isServerOnlyPath(filePath)
  );
}

function leadingDirective(sourceText: string, directive: string): boolean {
  const withoutLeadingComments = sourceText.replace(
    /^\s*(?:(?:\/\/[^\n]*\n)|(?:\/\*[\s\S]*?\*\/\s*))*/,
    "",
  );
  return new RegExp(`^["']${directive}["'];`).test(withoutLeadingComments);
}

function isClientComponent(sourceText: string): boolean {
  return leadingDirective(sourceText, "use client");
}

// Next.js route entry files and Server Action modules are the real runtime's
// composition roots. They reach the synthetic client runtime (src/lib/demo and
// src/app/_synthetic) only through the explicit mount points below: the root
// layout's demo gate and runtime mounts, and the loopback demo's document
// route. Hosted entry from the real login stays inside the auth form.
const routeEntryFile =
  /^src\/app\/(?:.*\/)?(?:page|layout|template|default|loading|error|not-found|global-error|route)\.[cm]?[jt]sx?$/;
const syntheticRuntimeEntryPoints: Readonly<Record<string, readonly string[]>> =
  {
    "src/app/layout.tsx": [
      "src/lib/demo/demo-runtime.application",
      "src/app/_synthetic/hosted-synthetic-runtime",
      "src/app/_synthetic/loopback-synthetic-runtime",
    ],
    "src/app/synthetic-runtime/[...path]/page.tsx": [
      "src/lib/demo/demo-runtime.application",
      "src/lib/demo/synthetic-route.application",
    ],
  };

function isRealRouteEntry(filePath: string, sourceText: string): boolean {
  return (
    routeEntryFile.test(filePath) ||
    /^src\/app\/(?:.*\/)?actions\.[cm]?[jt]sx?$/.test(filePath) ||
    (filePath.startsWith("src/app/") &&
      leadingDirective(sourceText, "use server"))
  );
}

function isSyntheticRuntimePath(filePath: string): boolean {
  return isDemoPath(filePath) || filePath.startsWith("src/app/_synthetic/");
}

function isAllowedSyntheticEntry(sourcePath: string, target: string): boolean {
  const withoutExtension = target.replace(/\.[cm]?[jt]sx?$/, "");
  return (
    syntheticRuntimeEntryPoints[sourcePath]?.includes(withoutExtension) ?? false
  );
}

function violation(
  code: BoundaryViolationCode,
  sourcePath: string,
  specifier: string,
  message: string,
): BoundaryViolation {
  return { code, sourcePath, specifier, message };
}

export function inspectModuleDependencies(
  sourcePath: string,
  sourceText: string,
): readonly BoundaryViolation[] {
  const normalizedSourcePath = toPosix(sourcePath);
  const sourceLayer = classifyModule(normalizedSourcePath);
  const clientComponent = isClientComponent(sourceText);
  const realRouteEntry = isRealRouteEntry(normalizedSourcePath, sourceText);
  const violations: BoundaryViolation[] = [];

  for (const specifier of collectImportSpecifiers(sourceText)) {
    const internalTarget = resolveInternalImport(
      normalizedSourcePath,
      specifier,
    );

    if (
      clientComponent &&
      internalTarget !== undefined &&
      isServerOnlyPath(internalTarget)
    ) {
      violations.push(
        violation(
          "client-imports-server",
          normalizedSourcePath,
          specifier,
          "Client Components cannot import server-only modules; move the read to a Server Component or Server Action.",
        ),
      );
    }

    if (
      internalTarget !== undefined &&
      isDemoPath(internalTarget) &&
      isRealModePath(normalizedSourcePath)
    ) {
      violations.push(
        violation(
          "real-mode-imports-demo",
          normalizedSourcePath,
          specifier,
          "Server adapters and real-mode library modules cannot import the synthetic demo runtime in src/lib/demo.",
        ),
      );
    }

    if (
      realRouteEntry &&
      internalTarget !== undefined &&
      isSyntheticRuntimePath(internalTarget) &&
      !isAllowedSyntheticEntry(normalizedSourcePath, internalTarget)
    ) {
      violations.push(
        violation(
          "route-imports-synthetic-runtime",
          normalizedSourcePath,
          specifier,
          "Real route files and Server Actions reach the synthetic runtime only through the root layout mount and the loopback demo route.",
        ),
      );
    }

    if (sourceLayer === "domain") {
      if (isFrameworkImport(specifier)) {
        violations.push(
          violation(
            "domain-imports-framework",
            normalizedSourcePath,
            specifier,
            "Domain modules must remain framework-neutral.",
          ),
        );
      }
      if (isProviderImport(specifier)) {
        violations.push(
          violation(
            "domain-imports-provider",
            normalizedSourcePath,
            specifier,
            "Provider SDKs belong in adapter modules, not domain modules.",
          ),
        );
      }
      if (
        internalTarget !== undefined &&
        (classifyModule(internalTarget) === "ui" ||
          classifyModule(internalTarget) === "application" ||
          classifyModule(internalTarget) === "adapter" ||
          internalTarget.startsWith("src/lib/config/") ||
          internalTarget.startsWith("src/lib/db/"))
      ) {
        violations.push(
          violation(
            "domain-imports-outer-layer",
            normalizedSourcePath,
            specifier,
            "Domain modules cannot import UI, application, adapter, configuration, or database implementations.",
          ),
        );
      }
    }

    if (sourceLayer === "application") {
      if (isFrameworkImport(specifier)) {
        violations.push(
          violation(
            "application-imports-framework",
            normalizedSourcePath,
            specifier,
            "Application modules must not depend on React or Next.js request/runtime objects.",
          ),
        );
      }
      if (isProviderImport(specifier)) {
        violations.push(
          violation(
            "application-imports-provider",
            normalizedSourcePath,
            specifier,
            "Application modules depend on adapter interfaces, not provider SDKs.",
          ),
        );
      }
      if (
        internalTarget !== undefined &&
        classifyModule(internalTarget) === "adapter"
      ) {
        violations.push(
          violation(
            "application-imports-concrete-adapter",
            normalizedSourcePath,
            specifier,
            "Inject a concrete adapter at a composition root instead of importing it into an application module.",
          ),
        );
      }
    }

    if (sourceLayer === "ui") {
      if (isProviderImport(specifier)) {
        violations.push(
          violation(
            "ui-imports-provider",
            normalizedSourcePath,
            specifier,
            "UI modules call application interfaces; provider SDKs remain server-side adapters.",
          ),
        );
      }
      if (
        internalTarget !== undefined &&
        (classifyModule(internalTarget) === "domain" ||
          classifyModule(internalTarget) === "adapter")
      ) {
        violations.push(
          violation(
            "ui-imports-inner-implementation",
            normalizedSourcePath,
            specifier,
            "UI modules depend on application interfaces, not domain or adapter implementations.",
          ),
        );
      }
    }
  }

  return violations;
}

async function listSourceFiles(directory: string): Promise<readonly string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(entryPath)));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

export async function scanModuleBoundaries(
  projectRoot: string,
): Promise<readonly BoundaryViolation[]> {
  const violations: BoundaryViolation[] = [];

  for (const sourceRoot of ["src", "workers"] as const) {
    const absoluteSourceRoot = path.join(projectRoot, sourceRoot);
    const files = await listSourceFiles(absoluteSourceRoot);

    for (const file of files) {
      const sourceText = await readFile(file, "utf8");
      const sourcePath = toPosix(path.relative(projectRoot, file));
      violations.push(...inspectModuleDependencies(sourcePath, sourceText));
    }
  }

  return violations;
}
