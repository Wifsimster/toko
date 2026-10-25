import type { Page } from "@playwright/test";

// Relevés synthétiques pour les e2e de Symptômes, servis à la place de
// `GET /api/symptoms/:childId` : les tests ne dépendent pas du seed démo
// (qui ne contient presque que des journées mitigées) et n'écrivent rien.
type SymptomFixture = {
  id: string;
  childId: string;
  date: string;
  agitation: number;
  focus: number;
  impulse: number;
  mood: number;
  sleep: number;
  routinesOk: boolean;
  context: string | null;
  notes: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
};

function reading(
  n: number,
  date: string,
  [agitation, focus, impulse, mood, sleep]: [number, number, number, number, number],
  extra: Partial<SymptomFixture> = {},
): SymptomFixture {
  return {
    id: `00000000-0000-4000-e2e0-${String(n).padStart(12, "0")}`,
    childId: "00000000-0000-4000-e2e0-000000000000",
    date,
    agitation,
    focus,
    impulse,
    mood,
    sleep,
    routinesOk: true,
    context: null,
    notes: null,
    createdByName: null,
    createdAt: `${date}T18:00:00.000Z`,
    updatedAt: `${date}T18:00:00.000Z`,
    ...extra,
  };
}

/** Une bonne journée, une mitigée et une difficile (score ≥ 7, 4 à 7, < 4). */
export const DAY_LEVEL_SYMPTOMS: SymptomFixture[] = [
  reading(1, "2026-10-03", [2, 8, 2, 8, 8], { context: "Journée fictive" }),
  reading(2, "2026-10-02", [5, 5, 5, 5, 5]),
  reading(3, "2026-10-01", [9, 2, 9, 2, 3], {
    routinesOk: false,
    notes: "Relevé synthétique pour les tests.",
  }),
];

export async function stubSymptoms(page: Page, data: SymptomFixture[]) {
  await page.route(/\/api\/symptoms\/[0-9a-f-]+$/, (route) =>
    route.request().method() === "GET"
      ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(data) })
      : route.continue(),
  );
}
