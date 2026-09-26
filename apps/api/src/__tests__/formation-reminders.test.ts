import { describe, it, expect } from "vitest";
import {
  decideFormationReminder,
  FORMATION_REMINDER_HOUR,
} from "../jobs/email/formation-reminders";

// Règle de relance de la formation Barkley : un parent qui a commencé puis
// fait une pause reçoit au plus 3 rappels (≈ J+7, J+14, J+28), à 19 h locale,
// et le compteur repart de zéro dès qu'il valide une nouvelle étape.

const DAY = 24 * 60 * 60 * 1000;
const lastCompletedAt = new Date("2026-09-01T18:00:00Z");
const at = (days: number) => new Date(lastCompletedAt.getTime() + days * DAY);

const base = {
  completedCount: 5,
  lastCompletedAt,
  lastReminderAt: null,
  reminderCount: 0,
  localHour: FORMATION_REMINDER_HOUR,
};

describe("decideFormationReminder", () => {
  it("ne relance pas un parent qui n'a pas commencé", () => {
    expect(
      decideFormationReminder({ ...base, completedCount: 0, lastCompletedAt: null, now: at(30) }),
    ).toEqual({ send: false, reason: "not-started" });
  });

  it("ne relance pas un parent qui a terminé les 10 étapes", () => {
    expect(decideFormationReminder({ ...base, completedCount: 10, now: at(30) })).toEqual({
      send: false,
      reason: "finished",
    });
  });

  it("n'envoie qu'à 19 h, heure locale", () => {
    expect(decideFormationReminder({ ...base, localHour: 8, now: at(8) })).toEqual({
      send: false,
      reason: "hour",
    });
  });

  it("attend 7 jours de pause avant le premier rappel", () => {
    expect(decideFormationReminder({ ...base, now: at(3) }).send).toBe(false);
    expect(decideFormationReminder({ ...base, now: at(7) })).toEqual({ send: true, count: 1 });
  });

  it("tolère une heure de décalage (étape validée à 19 h 40)", () => {
    expect(decideFormationReminder({ ...base, now: new Date(at(7).getTime() - 40 * 60 * 1000) }))
      .toEqual({ send: true, count: 1 });
  });

  it("espace les rappels : 2e une semaine après, 3e deux semaines après", () => {
    const first = at(7);
    expect(
      decideFormationReminder({ ...base, lastReminderAt: first, reminderCount: 1, now: at(10) }).send,
    ).toBe(false);
    expect(
      decideFormationReminder({ ...base, lastReminderAt: first, reminderCount: 1, now: at(14) }),
    ).toEqual({ send: true, count: 2 });
    const second = at(14);
    expect(
      decideFormationReminder({ ...base, lastReminderAt: second, reminderCount: 2, now: at(21) }).send,
    ).toBe(false);
    expect(
      decideFormationReminder({ ...base, lastReminderAt: second, reminderCount: 2, now: at(28) }),
    ).toEqual({ send: true, count: 3 });
  });

  it("s'arrête après 3 rappels pour une même pause", () => {
    expect(
      decideFormationReminder({ ...base, lastReminderAt: at(28), reminderCount: 3, now: at(90) }),
    ).toEqual({ send: false, reason: "capped" });
  });

  it("repart de zéro quand une étape est validée après le dernier rappel", () => {
    const resumed = at(40); // nouvelle étape validée après 3 rappels
    const input = { ...base, lastCompletedAt: resumed, lastReminderAt: at(28), reminderCount: 3 };
    expect(decideFormationReminder({ ...input, now: at(44) }).send).toBe(false);
    expect(decideFormationReminder({ ...input, now: at(47) })).toEqual({ send: true, count: 1 });
  });
});
