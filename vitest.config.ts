import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // stellar-sdk is large; avoid vitest-worker fetch timeouts on slow disks
    fileParallelism: false,
    pool: "forks",
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
