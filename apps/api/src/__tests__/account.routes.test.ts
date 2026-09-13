import { describe, it, expect } from "vitest";
import { app } from "../app";

// /api/account is now six sub-routers mounted under one prefix. These
// assert the mount actually composes the paths — a silently unmounted
// sub-router would answer 404 here instead of 401.

const ENDPOINTS: Array<[string, string]> = [
  ["DELETE", "/api/account"],
  ["POST", "/api/account/schedule-deletion"],
  ["POST", "/api/account/cancel-deletion"],
  ["GET", "/api/account/deletion-status"],
  ["GET", "/api/account/consents"],
  ["POST", "/api/account/consents"],
  ["DELETE", "/api/account/consents/owner_health_processing"],
  ["GET", "/api/account/nps-prompt"],
  ["POST", "/api/account/nps"],
  ["GET", "/api/account/export"],
  ["GET", "/api/account/lock-pin"],
  ["POST", "/api/account/lock-pin"],
  ["POST", "/api/account/lock-pin/verify"],
  ["DELETE", "/api/account/lock-pin"],
  ["GET", "/api/account/onboarding-time"],
  ["GET", "/api/account/koe-hash"],
];

describe("account router", () => {
  it.each(ENDPOINTS)("%s %s is mounted and requires a session", async (method, path) => {
    const res = await app.request(path, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(method === "GET" ? {} : { body: JSON.stringify({}) }),
    });
    expect(res.status).toBe(401);
  });
});
