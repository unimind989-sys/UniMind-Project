import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Inline projects do not inherit root options, so each project shares this resolver.
const resolve = {
  alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
};

export default defineConfig({
  test: {
    passWithNoTests: false,
    retry: 0,
    projects: [
      {
        resolve,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          testTimeout: 5_000,
          hookTimeout: 5_000,
        },
      },
      {
        resolve,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          testTimeout: 30_000,
          hookTimeout: 30_000,
          fileParallelism: false,
        },
      },
      {
        resolve,
        test: {
          name: "security",
          include: ["tests/security/**/*.test.ts"],
          testTimeout: 5_000,
          hookTimeout: 10_000,
        },
      },
      {
        resolve,
        test: {
          name: "evaluation",
          include: ["evals/runners/**/*-test.ts"],
          testTimeout: 5_000,
          hookTimeout: 5_000,
        },
      },
      {
        resolve,
        test: {
          name: "load",
          include: ["tests/load/**/*.test.ts"],
          testTimeout: 5_000,
          hookTimeout: 5_000,
        },
      },
    ],
  },
});
