import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    passWithNoTests: false,
    retry: 0,
    projects: [
      {
        resolve: {
          alias: Object.fromEntries(
            [
              "app/learn/synthetic-catalog",
              "app/learn/synthetic-workspace",
              "lib/admin/admin-presentation.application",
              "lib/demo/synthetic-account.application",
            ].map((module) => [
              `@/${module}`,
              fileURLToPath(new URL(`./src/${module}`, import.meta.url)),
            ]),
          ),
        },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          testTimeout: 5_000,
          hookTimeout: 5_000,
        },
      },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          testTimeout: 30_000,
          hookTimeout: 30_000,
          fileParallelism: false,
        },
      },
      {
        test: {
          name: "security",
          include: ["tests/security/**/*.test.ts"],
          testTimeout: 5_000,
          hookTimeout: 10_000,
          fileParallelism: false,
        },
      },
      {
        test: {
          name: "evaluation",
          include: ["evals/runners/**/*-test.ts"],
          testTimeout: 5_000,
          hookTimeout: 5_000,
        },
      },
      {
        test: {
          name: "load",
          include: ["tests/load/**/*.test.ts"],
          testTimeout: 5_000,
          hookTimeout: 5_000,
          fileParallelism: false,
        },
      },
    ],
  },
});
