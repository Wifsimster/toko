import { describe, it, expect } from "vitest";
import { resolveAndroidAppUrl, isIosDevice } from "../android-app";

describe("resolveAndroidAppUrl", () => {
  it("keeps a Play Store listing URL", () => {
    expect(
      resolveAndroidAppUrl(
        "https://play.google.com/store/apps/details?id=app.toko.mobile",
      ),
    ).toBe("https://play.google.com/store/apps/details?id=app.toko.mobile");
  });

  it("trims surrounding whitespace", () => {
    expect(resolveAndroidAppUrl("  https://toko.app/android  ")).toBe(
      "https://toko.app/android",
    );
  });

  it("returns null when unset or blank", () => {
    expect(resolveAndroidAppUrl(undefined)).toBeNull();
    expect(resolveAndroidAppUrl("")).toBeNull();
    expect(resolveAndroidAppUrl("   ")).toBeNull();
  });

  it("rejects a value that is not an http(s) URL", () => {
    expect(resolveAndroidAppUrl("not-a-url")).toBeNull();
    expect(resolveAndroidAppUrl("javascript:alert(1)")).toBeNull();
    expect(resolveAndroidAppUrl("market://details?id=app.toko.mobile")).toBeNull();
  });
});

describe("isIosDevice", () => {
  it("detects iPhone and iPad", () => {
    expect(
      isIosDevice(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      ),
    ).toBe(true);
    expect(isIosDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe(true);
  });

  it("does not match Android or desktop", () => {
    expect(isIosDevice("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe(false);
    expect(isIosDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe(false);
  });
});
