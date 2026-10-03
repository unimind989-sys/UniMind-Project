import { hasSyntheticServiceConfiguration } from "../config/env.schema";

/** Synthetic presentation is a separate loopback development runtime, never a
 * query switch, a real identity, or a production authorization exemption. */
export function resolveDemoRuntime(
  env: Readonly<Record<string, string | undefined>>,
) {
  if (env.UNIMIND_SYNTHETIC_DEMO !== "true") return "DISABLED";
  const origin = env.APP_ORIGIN ?? "";
  const safe =
    env.NODE_ENV === "development" &&
    /^http:\/\/127\.0\.0\.1:\d{4,5}$/u.test(origin) &&
    env.NEXT_PUBLIC_SUPABASE_URL === "https://synthetic.supabase.invalid" &&
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ===
      "synthetic-public-credential-only" &&
    hasSyntheticServiceConfiguration(env) &&
    env.PROVIDER_MODE === "mock" &&
    env.APPROVED_PROVIDER_BUDGET_MINOR === "0" &&
    [
      env.GENERATION_PROVIDER_ENABLED,
      env.EMBEDDING_PROVIDER_ENABLED,
      env.TRANSCRIPTION_PROVIDER_ENABLED,
    ].every((value) => value === "false");
  return safe ? "ENABLED" : "INVALID";
}

export function isProductDemoPath(path: string) {
  return (
    path === "/" ||
    path === "/auth/callback" ||
    /^\/(login|register|verify-email|consent|forgot-password|reset-password|settings)$/u.test(
      path,
    ) ||
    /^\/(learn|admin|batch-leader)(\/[^?#]*)?$/u.test(path)
  );
}
