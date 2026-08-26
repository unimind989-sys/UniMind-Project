import type { HostedDatabaseEnvironment } from "./hosted-supabase-target";

export type HostedProfileSource = "file" | "environment";

export type HostedAuthCommand = Readonly<{
  environment: HostedDatabaseEnvironment;
  profileSource: HostedProfileSource;
}>;

export function parseHostedAuthCommand(
  arguments_: readonly string[],
): HostedAuthCommand {
  if (
    arguments_.length !== 2 &&
    !(
      arguments_.length === 4 &&
      arguments_[2] === "--profile-source" &&
      ["file", "environment"].includes(arguments_[3] ?? "")
    )
  ) {
    throw new Error(
      "Expected --environment development or ci, optionally followed by --profile-source file or environment.",
    );
  }
  if (arguments_[0] !== "--environment") {
    throw new Error("Expected --environment development or ci.");
  }
  const environment = arguments_[1];
  if (environment !== "development" && environment !== "ci") {
    throw new Error("Hosted Auth environment must be development or ci.");
  }
  const profileSource = (arguments_[3] ?? "file") as HostedProfileSource;
  if (profileSource === "environment" && environment !== "ci") {
    throw new Error("Environment profile source is restricted to ci.");
  }
  return { environment, profileSource };
}
