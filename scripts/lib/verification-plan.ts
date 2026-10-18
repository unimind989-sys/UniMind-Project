export type VerificationProfile = "verify" | "check";

export type VerificationStage = Readonly<{
  components: readonly string[];
  parallel: boolean;
}>;

/** The fast edit-loop subset. Plain `typecheck` stays here because it is incremental. */
export const checkComponents = [
  "format:check",
  "lint",
  "typecheck",
  "check:boundaries",
  "check:sql",
  "scan:secrets",
  "lint:agents",
  "test:unit",
] as const;

/** Parses `pnpm a && pnpm b …`, the only form the CI workflow policy accepts. */
export function verifyCiComponents(script: string): string[] {
  const components = script.split("&&").map((part) => part.trim());
  const names = components.map(
    (component) => /^pnpm ([a-z0-9:-]+)$/u.exec(component)?.[1],
  );
  if (names.length === 0 || names.some((name) => name === undefined))
    throw new Error("verify:ci must be a list of `pnpm <script>` components.");
  return names as string[];
}

/**
 * Static checks run concurrently. Test components run one at a time in their
 * listed order, except the production build, which runs first so a build-only
 * failure is reported before the long browser suites (and so the later
 * `next dev` runs restore the committed `next-env.d.ts`).
 */
export function planVerification(
  profile: VerificationProfile,
  verifyCi: readonly string[],
): VerificationStage[] {
  if (profile === "check")
    return [{ components: [...checkComponents], parallel: true }];
  const tests = verifyCi.filter((component) => component.startsWith("test:"));
  const build = tests.filter((component) => component === "test:env-build");
  return [
    {
      components: verifyCi.filter(
        (component) => !component.startsWith("test:"),
      ),
      parallel: true,
    },
    {
      components: [
        ...build,
        ...tests.filter((component) => component !== "test:env-build"),
      ],
      parallel: false,
    },
  ];
}
