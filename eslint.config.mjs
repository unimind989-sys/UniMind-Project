import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  prettier,
  {
    files: ["src/**/*.{ts,tsx}", "scripts/**/*.{ts,mjs}", "workers/**/*.ts"],
    ignores: ["src/types/database.generated.ts"],
    rules: { "max-lines": ["error", { max: 800 }] },
  },
  {
    files: ["tests/**/*.ts", "evals/**/*.ts"],
    rules: { "max-lines": ["error", { max: 2000 }] },
  },
  globalIgnores([
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".impeccable/**",
    ".local/**",
    ".next/**",
    "build/**",
    "coverage/**",
    "dist/**",
    "out/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);
