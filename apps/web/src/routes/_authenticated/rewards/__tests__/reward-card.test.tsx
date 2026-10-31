import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";
import type { BarkleyReward } from "@focusflow/validators";
import i18n from "@/lib/i18n";
import { RewardCard } from "../reward-card";

function remainingText(html: string) {
  return html.match(/data-slot="progress-value"[^>]*>([^<]*)</)?.[1];
}

function render(starsRequired: number, availableStars: number) {
  const reward = {
    id: "r1",
    name: "Récompense fictive",
    icon: "gift",
    starsRequired,
    timesClaimed: 0,
  } as unknown as BarkleyReward;
  const noop = () => {};
  return renderToStaticMarkup(
    createElement(RewardCard, {
      reward,
      availableStars,
      kidView: true,
      onStartEdit: noop,
      onClaim: noop,
      onDelete: noop,
      claimPending: false,
      deletePending: false,
    }),
  );
}

describe("RewardCard remaining stars", () => {
  beforeAll(async () => {
    await i18n.changeLanguage("fr");
  });

  it("prints the plural count once", () => {
    expect(remainingText(render(20, 0))).toBe("20 étoiles restantes");
  });

  it("prints the count once for 5 remaining", () => {
    expect(remainingText(render(10, 5))).toBe("5 étoiles restantes");
  });

  it("uses the singular for 1 remaining", () => {
    expect(remainingText(render(10, 9))).toBe("1 étoile restante");
  });
});
