import { describe, it, expect } from "vitest";
import { BARKLEY_QUIZZES, QUESTIONS_PER_STEP_MIN } from "../barkley-quizzes";

describe("BARKLEY_QUIZZES content integrity", () => {
  const stepNumbers = Object.keys(BARKLEY_QUIZZES).map(Number);

  it("covers all 10 Barkley steps", () => {
    expect(stepNumbers.sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it.each(stepNumbers)(
    "step %i has at least QUESTIONS_PER_STEP_MIN questions",
    (step) => {
      const questions = BARKLEY_QUIZZES[step]!;
      expect(questions.length).toBeGreaterThanOrEqual(QUESTIONS_PER_STEP_MIN);
    },
  );

  it("every question has exactly 4 non-empty options", () => {
    for (const step of stepNumbers) {
      for (const q of BARKLEY_QUIZZES[step]!) {
        expect(q.options, `step ${step} Q ${q.id}`).toHaveLength(4);
        for (const opt of q.options) {
          expect(opt.trim().length, `step ${step} Q ${q.id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every question has a valid correctIndex (0-3)", () => {
    for (const step of stepNumbers) {
      for (const q of BARKLEY_QUIZZES[step]!) {
        expect(q.correctIndex, `step ${step} Q ${q.id}`).toBeGreaterThanOrEqual(
          0,
        );
        expect(q.correctIndex, `step ${step} Q ${q.id}`).toBeLessThan(4);
      }
    }
  });

  it("every question has a non-empty question text and explanation", () => {
    for (const step of stepNumbers) {
      for (const q of BARKLEY_QUIZZES[step]!) {
        expect(q.question.trim().length, `step ${step} Q ${q.id}`).toBeGreaterThan(0);
        expect(q.explanation.trim().length, `step ${step} Q ${q.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("all question ids are unique across the whole program", () => {
    const ids = stepNumbers.flatMap((s) =>
      BARKLEY_QUIZZES[s]!.map((q) => q.id),
    );
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("question ids follow the 'step-n' convention", () => {
    for (const step of stepNumbers) {
      for (const q of BARKLEY_QUIZZES[step]!) {
        expect(q.id).toMatch(new RegExp(`^${step}-\\d+$`));
      }
    }
  });
});
