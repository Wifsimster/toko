import { describe, it, expect } from "vitest";
import { redact } from "../lib/safe-logger";

describe("redact", () => {
  it("masks forbidden keys", () => {
    expect(redact({ email: "a@b.com", ok: 1 })).toEqual({
      email: "[redacted]",
      ok: 1,
    });
  });

  it("replaces email patterns inside strings", () => {
    expect(redact("Contact: foo@bar.com please")).toBe(
      "Contact: [email] please"
    );
  });

  it("recurses into nested objects and arrays", () => {
    const input = {
      user: { email: "a@b.com", id: "u1" },
      tokens: [{ token: "abc" }, { token: "def" }],
    };
    expect(redact(input)).toEqual({
      user: { email: "[redacted]", id: "u1" },
      tokens: [{ token: "[redacted]" }, { token: "[redacted]" }],
    });
  });

  it("scrubs Error objects without losing the name", () => {
    const err = new Error("user a@b.com not found");
    const out = redact(err) as { name: string; message: string };
    expect(out.name).toBe("Error");
    expect(out.message).toBe("user [email] not found");
  });

  it("handles primitive values and null", () => {
    expect(redact(42)).toBe(42);
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
  });

  it("stops recursing past the depth cap", () => {
    const deep: Record<string, unknown> = {};
    let cur = deep;
    for (let i = 0; i < 12; i++) {
      const next: Record<string, unknown> = {};
      cur.next = next;
      cur = next;
    }
    const out = JSON.stringify(redact(deep));
    expect(out).toContain("[truncated]");
  });
});
