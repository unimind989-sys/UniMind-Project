import { format } from "prettier";

export function formatGeneratedDatabaseTypes(source: string): Promise<string> {
  const stableSource = source.replace(
    /^  \/\/ Allows to automatically instantiate createClient with right options\r?\n^  \/\/ instead of createClient<[^\r\n]+>\(URL, KEY\)\r?\n^  __InternalSupabase: \{\r?\n(?:^    [^\r\n]*\r?\n)*^  \};?\r?\n/mu,
    "",
  );

  return format(stableSource, {
    parser: "typescript",
    semi: true,
  });
}
