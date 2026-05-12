import { describe, it, expect } from "vitest";
import { app } from "../app";
import { bucketFor } from "../routes/feature-flags";

describe("GET /api/feature-flags", () => {
  it("returns 401 without a session", async () => {
    const res = await app.request("/api/feature-flags");
    expect(res.status).toBe(401);
  });
});

describe("bucketFor — deterministic A/B bucketing", () => {
  const variants = [
    { value: "A", weight: 50 },
    { value: "B", weight: 50 },
  ];

  it("returns the same variant for the same (userId, flagKey) pair", () => {
    const a = bucketFor("user-1", "paywall_variant", variants);
    const b = bucketFor("user-1", "paywall_variant", variants);
    expect(a).toBe(b);
  });

  it("distributes users across both variants over many users", () => {
    const counts = { A: 0, B: 0 };
    for (let i = 0; i < 1000; i++) {
      const v = bucketFor(`user-${i}`, "paywall_variant", variants) as
        | "A"
        | "B";
      counts[v]++;
    }
    expect(counts.A).toBeGreaterThan(400);
    expect(counts.B).toBeGreaterThan(400);
  });

  it("honors lopsided weights", () => {
    const skewed = [
      { value: "A", weight: 90 },
      { value: "B", weight: 10 },
    ];
    const counts = { A: 0, B: 0 };
    for (let i = 0; i < 1000; i++) {
      const v = bucketFor(`user-${i}`, "k", skewed) as "A" | "B";
      counts[v]++;
    }
    expect(counts.A).toBeGreaterThan(counts.B * 4);
  });

  it("returns the only variant when weights sum to zero", () => {
    const zero = [
      { value: "A", weight: 0 },
      { value: "B", weight: 0 },
    ];
    expect(bucketFor("any-user", "k", zero)).toBe("A");
  });
});
