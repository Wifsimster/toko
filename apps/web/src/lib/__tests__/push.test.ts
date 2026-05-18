import { describe, it, expect } from "vitest";
import { urlBase64ToUint8Array } from "../push";

describe("urlBase64ToUint8Array", () => {
  it("decodes url-safe characters and restores missing padding", () => {
    // base64url "-_8" → base64 "+/8=" → bytes [0xFB, 0xFF]
    expect(Array.from(urlBase64ToUint8Array("-_8"))).toEqual([0xfb, 0xff]);
  });

  it("decodes a standard base64url value", () => {
    // "AQID" → bytes [1, 2, 3]
    expect(Array.from(urlBase64ToUint8Array("AQID"))).toEqual([1, 2, 3]);
  });

  it("produces a 65-byte key from an 87-char VAPID public key", () => {
    const key = "B" + "A".repeat(86);
    expect(urlBase64ToUint8Array(key).length).toBe(65);
  });
});
