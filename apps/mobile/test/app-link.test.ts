import { createRequire } from "node:module";
import { dirname } from "node:path";
import { describe, expect, it } from "vitest";
import { appLinkRoute, isAppLink, type ParsedLink } from "../src/lib/app-link";

const require = createRequire(import.meta.url);
const expoDir = dirname(require.resolve("expo/package.json"));
const { URL: ExpoURL } = require(
  require.resolve("whatwg-url-without-unicode", { paths: [expoDir] }),
) as { URL: typeof URL };

function parseLikeExpoLinking(url: string): ParsedLink {
  const parsed = new ExpoURL(url);
  const path = parsed.pathname || null;
  return {
    scheme: parsed.protocol ? parsed.protocol.slice(0, -1) : null,
    hostname: parsed.hostname || null,
    path: path ? path.replace(/^\//, "") : null,
  };
}

describe("parseLikeExpoLinking", () => {
  it("puts the route of a custom scheme without a third slash in the host", () => {
    expect(parseLikeExpoLinking("toko://checkin")).toEqual({
      scheme: "toko",
      hostname: "checkin",
      path: null,
    });
    expect(parseLikeExpoLinking("toko:///checkin")).toEqual({
      scheme: "toko",
      hostname: null,
      path: "checkin",
    });
  });
});

describe("isAppLink on the URL shapes the app receives", () => {
  it.each([
    ["toko://checkin", "checkin"],
    ["toko://home", "home"],
    ["toko:///checkin", "checkin"],
    ["toko:///home", "home"],
    ["toko://checkin/", "checkin"],
    ["toko://checkin?from=reminder", "checkin"],
    ["http://localhost:8081/checkin", "checkin"],
    ["https://toko.battistella.ovh/home", "home"],
  ])("%s is a link to %s", (url, route) => {
    const parsed = parseLikeExpoLinking(url);
    expect(appLinkRoute(parsed)).toBe(route);
    expect(isAppLink(parsed)).toBe(true);
  });

  it.each([
    "toko://",
    "toko:///",
    "http://localhost:8081/",
    "https://toko.battistella.ovh",
    "exp://192.168.1.20:8081",
  ])("%s is a plain launch", (url) => {
    expect(isAppLink(parseLikeExpoLinking(url))).toBe(false);
  });

  it("does not take a server host for a route", () => {
    expect(appLinkRoute(parseLikeExpoLinking("exp://192.168.1.20:8081/--/checkin"))).toBe(
      "--/checkin",
    );
    expect(isAppLink(parseLikeExpoLinking("exp://192.168.1.20:8081"))).toBe(false);
  });
});

describe("isAppLink on parsed objects", () => {
  it("reads the route from the host or the path", () => {
    expect(isAppLink({ scheme: "toko", hostname: "checkin", path: null })).toBe(true);
    expect(isAppLink({ scheme: "toko", hostname: null, path: "home" })).toBe(true);
    expect(isAppLink({ scheme: "exp", hostname: null, path: "checkin" })).toBe(true);
  });

  it("is false for an empty launch or nothing at all", () => {
    expect(isAppLink({ scheme: "toko", hostname: null, path: null })).toBe(false);
    expect(isAppLink({ scheme: null, hostname: null, path: null })).toBe(false);
    expect(isAppLink(null)).toBe(false);
    expect(isAppLink(undefined)).toBe(false);
  });
});
