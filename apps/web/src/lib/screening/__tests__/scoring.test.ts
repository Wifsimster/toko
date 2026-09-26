import { describe, it, expect } from "vitest";
import { QUESTIONNAIRES, QUESTIONNAIRE_IDS } from "../questionnaires";
import { score } from "../scoring";

const BANNED = /\b(oubli|retard|raté|échec|faute|nul)\w*/iu;

describe("questionnaires content", () => {
  it.each(QUESTIONNAIRE_IDS)("%s is well formed", (id) => {
    const q = QUESTIONNAIRES[id];
    expect(q.id).toBe(id);
    for (const item of q.items) {
      expect(q.dimensions.some((d) => d.id === item.dimension)).toBe(true);
      expect(item.text.fr.trim()).not.toBe("");
      expect(item.text.en.trim()).not.toBe("");
    }
    for (const d of q.dimensions) {
      const total = q.items.filter((i) => i.dimension === d.id).length;
      expect(d.threshold).toBeLessThanOrEqual(total);
    }
  });

  it("uses the validated item counts", () => {
    expect(QUESTIONNAIRES["tdah-adulte"].items).toHaveLength(6);
    expect(QUESTIONNAIRES["tdah-enfant"].items).toHaveLength(18);
    expect(QUESTIONNAIRES["top-enfant"].items).toHaveLength(8);
    expect(QUESTIONNAIRES["autisme-adulte"].items).toHaveLength(10);
    expect(QUESTIONNAIRES["autisme-enfant"].items).toHaveLength(10);
  });

  it("keeps the French copy free of the guilt lexicon", () => {
    for (const id of QUESTIONNAIRE_IDS) {
      const q = QUESTIONNAIRES[id];
      const texts = [
        ...q.items.flatMap((i) => [i.text.fr, i.example?.fr ?? ""]),
        ...q.nextSteps.map((s) => s.text.fr),
        q.title.fr,
        q.subtitle.fr,
      ];
      for (const t of texts) expect(t, `${id}: ${t}`).not.toMatch(BANNED);
    }
  });
});

describe("ASRS v1.1 part A", () => {
  const q = QUESTIONNAIRES["tdah-adulte"];

  it("uses Sometimes as cut-off for items 1-3 and Often for items 4-6", () => {
    // 1-3 at "Parfois" (2) → 3 signs ; 4-6 at "Parfois" → 0 sign.
    expect(score(q, [2, 2, 2, 2, 2, 2]).dimensions[0]!.count).toBe(3);
    expect(score(q, [2, 2, 2, 3, 2, 2]).dimensions[0]!.count).toBe(4);
  });

  it("flags from 4 signs out of 6", () => {
    expect(score(q, [2, 2, 2, 3, 0, 0]).level).toBe("high");
    expect(score(q, [2, 2, 0, 0, 0, 0]).level).toBe("some");
    expect(score(q, [0, 0, 0, 0, 0, 0]).level).toBe("low");
  });
});

describe("SNAP-IV", () => {
  const q = QUESTIONNAIRES["tdah-enfant"];
  const fill = (inatt: number, hyper: number) => [
    ...Array.from({ length: 9 }, (_, i) => (i < inatt ? 2 : 1)),
    ...Array.from({ length: 9 }, (_, i) => (i < hyper ? 3 : 0)),
  ];

  it("scores each part separately", () => {
    const r = score(q, fill(6, 2));
    expect(r.dimensions.map((d) => [d.id, d.count, d.level])).toEqual([
      ["inattention", 6, "high"],
      ["hyperactivite", 2, "low"],
    ]);
    expect(r.level).toBe("high");
  });

  it("does not count 'Un peu' as a sign", () => {
    expect(score(q, Array(18).fill(1)).level).toBe("low");
  });
});

describe("SNAP-IV opposition (TOP)", () => {
  const q = QUESTIONNAIRES["top-enfant"];

  it("flags from 4 signs out of 8", () => {
    expect(score(q, [2, 2, 3, 3, 0, 0, 0, 0]).level).toBe("high");
    expect(score(q, [2, 3, 0, 0, 1, 1, 1, 1]).level).toBe("some");
    expect(score(q, [1, 1, 1, 1, 1, 1, 1, 1]).level).toBe("low");
  });
});

describe("AQ-10", () => {
  it.each(["autisme-adulte", "autisme-enfant"] as const)(
    "%s scores agreement and disagreement keys",
    (id) => {
      const q = QUESTIONNAIRES[id];
      // Answer every item in the direction that scores → 10/10.
      const max = q.items.map((i) => ("lte" in i.positive ? 0 : 3));
      expect(score(q, max).dimensions[0]!.count).toBe(10);
      const min = q.items.map((i) => ("lte" in i.positive ? 3 : 0));
      expect(score(q, min).dimensions[0]!.count).toBe(0);
      // "Plutôt" answers count the same as "Tout à fait".
      const slight = q.items.map((i) => ("lte" in i.positive ? 1 : 2));
      expect(score(q, slight).level).toBe("high");
    },
  );

  it("uses the published key for the adult version", () => {
    const keyed = QUESTIONNAIRES["autisme-adulte"].items
      .map((i, n) => ("lte" in i.positive ? n + 1 : null))
      .filter(Boolean);
    expect(keyed).toEqual([1, 7, 8, 10]);
  });

  it("uses the published key for the child version", () => {
    const keyed = QUESTIONNAIRES["autisme-enfant"].items
      .map((i, n) => ("lte" in i.positive ? n + 1 : null))
      .filter(Boolean);
    expect(keyed).toEqual([1, 5, 7, 10]);
  });

  it("ignores unanswered items", () => {
    expect(score(QUESTIONNAIRES["autisme-adulte"], Array(10).fill(null)).level).toBe("low");
  });
});

describe("parcours and overlaps", () => {
  it("chains the complete parcours with the right sections", async () => {
    const { getParcours, questionCount } = await import("../parcours");
    expect(getParcours("complet-adulte").sections.map((q) => q.id)).toEqual([
      "tdah-adulte",
      "autisme-adulte",
    ]);
    expect(questionCount(getParcours("complet-enfant"))).toBe(18 + 8 + 10);
    expect(getParcours("tdah-enfant").sections).toHaveLength(1);
  });

  it("flags AuDHD when both ADHD and autism stand out", async () => {
    const { overlapNotes } = await import("../parcours");
    const notes = overlapNotes([
      { topic: "tdah", level: "high" },
      { topic: "autisme", level: "some" },
    ]);
    expect(notes.map((n) => n.topics)).toEqual([["tdah", "autisme"]]);
  });

  it("stays quiet when one side is low or both are only close", async () => {
    const { overlapNotes } = await import("../parcours");
    expect(overlapNotes([{ topic: "tdah", level: "high" }, { topic: "autisme", level: "low" }])).toEqual([]);
    expect(overlapNotes([{ topic: "tdah", level: "some" }, { topic: "top", level: "some" }])).toEqual([]);
  });
});
