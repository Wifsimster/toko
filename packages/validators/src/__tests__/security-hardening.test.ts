import { describe, it, expect } from "vitest";
import {
  createEventSchema,
  isAllowedPushEndpoint,
  pushSubscriptionSchema,
  reorderCrisisItemsSchema,
  removeLockPinSchema,
  setLockPinSchema,
  updateJournalEntrySchema,
  updateMedicationSchema,
  updateChildSchema,
  updateNewsSchema,
} from "../index";

const keys = { p256dh: "p", auth: "a" };

describe("push endpoint allowlist", () => {
  it.each([
    "https://fcm.googleapis.com/fcm/send/abc",
    "https://updates.push.services.mozilla.com/wpush/v2/abc",
    "https://web.push.apple.com/QAbc",
    "https://wns2-par02p.notify.windows.com/w/?token=abc",
  ])("accepts %s", (endpoint) => {
    expect(pushSubscriptionSchema.safeParse({ endpoint, keys }).success).toBe(true);
  });

  it.each([
    "http://fcm.googleapis.com/fcm/send/abc",
    "https://192.168.0.10/hook",
    "https://172.18.0.5:8080/x",
    "https://localhost/x",
    "https://fcm.googleapis.com.evil.example/x",
    "https://evilpush.apple.com.example/x",
    "https://fcm.googleapis.com:8443/x",
    "https://user:pw@fcm.googleapis.com/x",
    "not a url",
  ])("rejects %s", (endpoint) => {
    expect(isAllowedPushEndpoint(endpoint)).toBe(false);
    expect(pushSubscriptionSchema.safeParse({ endpoint, keys }).success).toBe(false);
  });
});

describe("analytics event properties", () => {
  const base = { eventName: "cta_clicked", sessionId: "s1" } as const;

  it("accepts flat primitive properties", () => {
    expect(
      createEventSchema.safeParse({ ...base, properties: { location: "hero", n: 2, ok: true } })
        .success,
    ).toBe(true);
  });

  it("rejects nested objects, long strings and too many keys", () => {
    expect(createEventSchema.safeParse({ ...base, properties: { a: { b: 1 } } }).success).toBe(false);
    expect(createEventSchema.safeParse({ ...base, properties: { a: "x".repeat(201) } }).success).toBe(
      false,
    );
    const many = Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`k${i}`, i]));
    expect(createEventSchema.safeParse({ ...base, properties: many }).success).toBe(false);
  });
});

describe("reorder lists are bounded", () => {
  it("rejects more than 200 ids", () => {
    const ids = Array.from({ length: 201 }, () => crypto.randomUUID());
    expect(
      reorderCrisisItemsSchema.safeParse({ childId: crypto.randomUUID(), orderedIds: ids }).success,
    ).toBe(false);
  });
});

describe("lock PIN changes", () => {
  it("accepts an optional current PIN when setting", () => {
    expect(setLockPinSchema.safeParse({ pin: "1234" }).success).toBe(true);
    expect(setLockPinSchema.safeParse({ pin: "1234", currentPin: "5678" }).success).toBe(true);
  });

  it("requires the current PIN to remove", () => {
    expect(removeLockPinSchema.safeParse({}).success).toBe(false);
    expect(removeLockPinSchema.safeParse({ currentPin: "1234" }).success).toBe(true);
  });
});

describe("partial updates never inject create defaults", () => {
  it("leaves omitted fields out of the parsed patch", () => {
    expect(updateMedicationSchema.parse({ name: "Ritaline" })).toEqual({ name: "Ritaline" });
    expect(updateJournalEntrySchema.parse({ date: "2026-11-04" })).toEqual({ date: "2026-11-04" });
    expect(updateChildSchema.parse({ name: "Léo" })).toEqual({ name: "Léo" });
    expect(updateNewsSchema.parse({ title: "t" })).toEqual({ title: "t" });
  });
});
