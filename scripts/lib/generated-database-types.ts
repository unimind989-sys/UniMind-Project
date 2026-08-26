import { format } from "prettier";

export function formatGeneratedDatabaseTypes(source: string): Promise<string> {
  return format(source, {
    parser: "typescript",
    semi: true,
  });
}
