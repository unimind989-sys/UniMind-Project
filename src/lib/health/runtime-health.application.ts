export type RuntimeHealth = Readonly<{
  status: "live" | "ready" | "not_ready";
  httpStatus: 200 | 503;
}>;

export function reportLiveness(): RuntimeHealth {
  return { status: "live", httpStatus: 200 };
}

export function assessReadiness(
  validateRuntimeConfiguration: () => unknown,
): RuntimeHealth {
  try {
    validateRuntimeConfiguration();
    return { status: "ready", httpStatus: 200 };
  } catch {
    return { status: "not_ready", httpStatus: 503 };
  }
}
