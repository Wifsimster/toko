import { describe, it, expect } from "vitest";
import { redact, redactRequestLine } from "../lib/safe-logger";

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

describe("redactRequestLine", () => {
  it("masks verification, reset and unsubscribe secrets in access-log lines", () => {
    expect(
      redactRequestLine(
        "<-- GET /api/auth/verify-email?token=eyJhbGciOiJIUzI1NiJ9.e30.sig&callbackURL=http%3A%2F%2Fx%2Flogin%3Fverified%3D1",
      ),
    ).toBe("<-- GET /api/auth/verify-email?token=[redacted]&callbackURL=[redacted]");
    expect(redactRequestLine("--> GET /api/auth/reset-password/AbC123?callbackURL=%2Freset 302 4ms")).toBe(
      "--> GET /api/auth/reset-password/[redacted]?callbackURL=[redacted] 302 4ms",
    );
    expect(redactRequestLine("<-- GET /api/unsubscribe?type=digest&token=xyz")).toBe(
      "<-- GET /api/unsubscribe?type=digest&token=[redacted]",
    );
  });

  it("leaves ordinary request lines alone", () => {
    expect(redactRequestLine("--> GET /api/children?childId=c1 200 12ms")).toBe(
      "--> GET /api/children?childId=c1 200 12ms",
    );
  });
});
