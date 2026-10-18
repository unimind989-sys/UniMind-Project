import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// DESIGN.md is the token authority: product CSS uses the Cobalt names only.
// The Open Folio aliases were removed in WP03-T25 and must not return.
const retiredAliases = [
  "accent",
  "accent-focus",
  "accent-hover",
  "accent-ink",
  "accent-soft",
  "accent-text",
  "annotation",
  "border",
  "canvas",
  "canvas-deep",
  "control-border",
  "danger-surface",
  "error",
  "hover",
  "line-quiet",
  "muted",
  "on-accent",
  "ready",
  "ready-surface",
  "spine",
  "spine-active",
  "spine-ink",
  "spine-secondary",
  "subtle",
  "success-surface",
  "surface-active",
  "surface-focus",
  "surface-strong",
  "text-muted",
  "text-primary",
  "text-secondary",
];

const root = path.resolve(__dirname, "../..");
const walk = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(path.join(directory, entry.name))
      : [path.join(directory, entry.name)],
  );
const stylesheets = walk(path.join(root, "src"))
  .filter((file) => file.endsWith(".css"))
  .map((file) => ({
    file: path.relative(root, file).split(path.sep).join("/"),
    text: readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""),
  }));

// Token definitions live in globals.css; the landing may keep the depicted
// handout's own palette (DESIGN.md "Public landing").
const literalColorAllowed = (file: string) =>
  file === "src/app/globals.css" ||
  /^src\/app\/_components\/landing[\w-]*\.module\.css$/u.test(file);

describe("design tokens", () => {
  it("finds the product stylesheets", () => {
    expect(stylesheets.length).toBeGreaterThan(10);
    expect(stylesheets.map((sheet) => sheet.file)).toContain(
      "src/app/globals.css",
    );
  });

  it("uses no retired Open Folio alias, as a definition or a reference", () => {
    const pattern = new RegExp(
      `--(?:${retiredAliases.join("|")})(?![\\w-])`,
      "gu",
    );
    const found = stylesheets.flatMap(({ file, text }) =>
      [...text.matchAll(pattern)].map((match) => `${file}: ${match[0]}`),
    );
    expect(found).toEqual([]);
  });

  it("keeps hex colour literals in globals.css and the landing only", () => {
    const found = stylesheets
      .filter(({ file }) => !literalColorAllowed(file))
      .flatMap(({ file, text }) =>
        [
          ...text
            .replace(/url\([^)]*\)/gu, "")
            .matchAll(/#[\da-f]{3,8}(?![\w-])/giu),
        ].map((match) => `${file}: ${match[0]}`),
      );
    expect(found).toEqual([]);
  });

  it("defines the component tokens DESIGN.md names", () => {
    const globals = stylesheets.find(
      ({ file }) => file === "src/app/globals.css",
    )!.text;
    for (const token of [
      "--cover-current",
      "--seg-on",
      "--seg-on-ink",
      "--radius-segment",
      "--radius-quote",
      "--float",
      "--float-up",
    ])
      expect(globals).toContain(`${token}:`);
  });
});
