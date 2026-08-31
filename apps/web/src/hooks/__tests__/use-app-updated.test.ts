import { describe, it, expect } from "vitest";
import { announcementFor } from "../use-app-updated";
import { changelog } from "@/lib/changelog";

// La toute première entrée du journal, celle qui inaugure la page.
const FIRST = changelog[changelog.length - 1]!;

describe("announcementFor", () => {
  it("stays silent on a first visit", () => {
    expect(announcementFor(null, FIRST.version)).toEqual({
      announce: false,
      changeCount: 0,
    });
  });

  it("stays silent when nothing new has shipped", () => {
    expect(announcementFor(FIRST.version, FIRST.version).announce).toBe(false);
  });

  it("stays silent when the running build is older than what was seen", () => {
    expect(announcementFor("99.0.0", FIRST.version).announce).toBe(false);
  });

  it("announces a notable version the parent has not seen", () => {
    const result = announcementFor("0.0.1", FIRST.version);
    expect(result.announce).toBe(FIRST.notable);
    if (FIRST.notable) {
      expect(result.changeCount).toBeGreaterThan(0);
    }
  });

  it("stays silent for a version with no entry at all", () => {
    // Un correctif de plomberie interne : la version bouge, le journal non.
    // C'est exactement ce que l'ancien bandeau interrompait pour rien.
    const patched = `${FIRST.version}.9999`;
    expect(announcementFor(FIRST.version, patched).announce).toBe(false);
  });
});
