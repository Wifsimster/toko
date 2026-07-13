import { describe, it, expect, beforeAll } from "vitest";
import {
  encryptField,
  decryptField,
  encryptBytes,
  decryptBytes,
} from "../lib/encryption";

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

describe("encryptBytes / decryptBytes (vault)", () => {
  it("round-trips binary content", () => {
    // A tiny fake PDF header + random-ish bytes.
    const plain = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xff, 0x10, 0x42]);
    const enc = encryptBytes(plain);
    expect(enc.subarray(0, 4).toString()).toBe("ENC1");
    expect(enc.equals(plain)).toBe(false);
    expect(decryptBytes(enc).equals(plain)).toBe(true);
  });

  it("returns legacy plaintext bytes untouched (no marker)", () => {
    const legacy = Buffer.from("%PDF-1.4 legacy file");
    expect(decryptBytes(legacy).equals(legacy)).toBe(true);
  });

  it("preserves the exact byte length after round-trip", () => {
    const plain = Buffer.alloc(1000, 7);
    expect(decryptBytes(encryptBytes(plain)).length).toBe(1000);
  });

  it("fails to decrypt tampered ciphertext (auth tag)", () => {
    const enc = encryptBytes(Buffer.from("sensitive"));
    enc[enc.length - 1] ^= 0xff; // flip a ciphertext byte
    expect(() => decryptBytes(enc)).toThrow();
  });
});
