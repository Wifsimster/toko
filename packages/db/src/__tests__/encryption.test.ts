import { describe, it, expect, beforeAll } from "vitest";
import { encryptField, decryptField } from "../lib/encryption";

beforeAll(() => {
  process.env.DB_ENCRYPTION_KEY =
    "0000000000000000000000000000000000000000000000000000000000000001";
});

describe("encryptField / decryptField", () => {
  it("round-trips a plaintext value", () => {
    const plaintext = "Lucas";
    const enc = encryptField(plaintext);
    expect(enc).toMatch(/^enc::v1::/);
    expect(decryptField(enc)).toBe(plaintext);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    const a = encryptField("Emma");
    const b = encryptField("Emma");
    expect(a).not.toBe(b);
    expect(decryptField(a)).toBe("Emma");
    expect(decryptField(b)).toBe("Emma");
  });

  it("returns legacy plaintext as-is (no prefix)", () => {
    expect(decryptField("legacy-value")).toBe("legacy-value");
  });

  it("round-trips unicode", () => {
    const plaintext = "Eléa 🌱";
    expect(decryptField(encryptField(plaintext))).toBe(plaintext);
  });
});
