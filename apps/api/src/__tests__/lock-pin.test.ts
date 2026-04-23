import { describe, it, expect } from "vitest";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { lockPinSchema } from "@focusflow/validators";

function hashPin(pin: string, salt: string): string {
  return createHash("sha256").update(salt + pin).digest("hex");
}

describe("lockPinSchema", () => {
  it.each(["1234", "12345", "123456"])("accepts %s", (pin) => {
    expect(lockPinSchema.safeParse(pin).success).toBe(true);
  });

  it.each(["123", "1234567", "abcd", "12 34", "12-34"])("rejects %s", (pin) => {
    expect(lockPinSchema.safeParse(pin).success).toBe(false);
  });
});

describe("pin hashing", () => {
  it("round-trips with constant-time compare", () => {
    const salt = randomBytes(16).toString("hex");
    const stored = hashPin("1234", salt);
    const candidate = hashPin("1234", salt);
    const a = Buffer.from(stored, "hex");
    const b = Buffer.from(candidate, "hex");
    expect(a.length).toBe(b.length);
    expect(timingSafeEqual(a, b)).toBe(true);
  });

  it("different salts for same PIN produce different hashes", () => {
    const s1 = "0000000000000000";
    const s2 = "1111111111111111";
    expect(hashPin("1234", s1)).not.toBe(hashPin("1234", s2));
  });

  it("wrong PIN fails the compare", () => {
    const salt = randomBytes(16).toString("hex");
    const stored = hashPin("1234", salt);
    const candidate = hashPin("9999", salt);
    expect(stored).not.toBe(candidate);
  });
});
