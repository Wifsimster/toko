import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Integration suites (*.integration.test.ts) share a single Postgres
    // database and TRUNCATE between cases. Running test files in parallel
    // lets one suite's cleanup wipe another's rows mid-test, so files run
    // serially to keep that shared DB consistent.
    fileParallelism: false,
  },
});
