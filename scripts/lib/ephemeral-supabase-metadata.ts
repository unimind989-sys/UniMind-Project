export type SupabaseContainer = Readonly<{
  name: string;
  image: string;
}>;

export type PostgresRuntimeMetadata = Readonly<{
  version: string;
  extensions: Readonly<Record<string, string>>;
}>;

export function findSupabaseContainer(
  source: string,
  service: "db" | "rest",
): SupabaseContainer {
  const prefix = `supabase_${service}_`;
  const matches = source
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split("\t"))
    .filter(([name, image]) => name?.startsWith(prefix) && image !== undefined)
    .map(([name, image]) => ({ name: name ?? "", image: image ?? "" }));

  if (matches.length !== 1) {
    throw new Error(`Expected one disposable Supabase ${service} container.`);
  }
  return matches[0] as SupabaseContainer;
}

export function parsePostgresRuntimeMetadata(
  source: string,
): PostgresRuntimeMetadata {
  const lines = source
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const version = lines.shift();
  if (version === undefined) {
    throw new Error("PostgreSQL runtime metadata is missing its version.");
  }

  const extensions = Object.fromEntries(
    lines.map((line) => {
      const separator = line.indexOf("=");
      if (separator <= 0 || separator === line.length - 1) {
        throw new Error("PostgreSQL extension metadata is malformed.");
      }
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
  );

  return { version, extensions };
}
