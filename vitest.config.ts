import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: false,
    retry: 0,
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          testTimeout: 2_000,
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
