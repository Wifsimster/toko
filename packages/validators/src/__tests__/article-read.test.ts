import { describe, expect, it } from "vitest";
import {
  articleChangedOn,
  articleNewSince,
  articleReadStatus,
  articleStatuses,
  countUnseenArticles,
  markArticleReadSchema,
} from "../article-read";

const FALLBACK = "2026-02-01";

describe("markArticleReadSchema", () => {
  it("accepts an article slug", () => {
    expect(markArticleReadSchema.safeParse({ slug: "crise-tdah-enfant-guide-complet" }).success).toBe(true);
  });

  it("rejects an empty, uppercase or path-like slug", () => {
    expect(markArticleReadSchema.safeParse({ slug: "" }).success).toBe(false);
    expect(markArticleReadSchema.safeParse({ slug: "Crise" }).success).toBe(false);
    expect(markArticleReadSchema.safeParse({ slug: "../admin" }).success).toBe(false);
    expect(markArticleReadSchema.safeParse({}).success).toBe(false);
  });
});

describe("articleChangedOn", () => {
  it("takes the latest of publication and review", () => {
    expect(articleChangedOn({ publishedAt: "2026-08-31", lastReviewedAt: "2026-10-02" }, FALLBACK)).toBe("2026-10-02");
    expect(articleChangedOn({ publishedAt: "2026-08-31" }, FALLBACK)).toBe("2026-08-31");
  });

  it("falls back to the default review date", () => {
    expect(articleChangedOn({}, FALLBACK)).toBe(FALLBACK);
  });
});

describe("articleNewSince", () => {
  it("starts 21 days before the account creation", () => {
    expect(articleNewSince("2026-12-22T09:30:00.000Z")).toBe("2026-12-01");
  });

  it("never reaches before the start of read tracking for older accounts", () => {
    expect(articleNewSince("2025-05-01T00:00:00.000Z")).toBe("2026-10-17");
  });
});

describe("articleReadStatus", () => {
  const since = "2026-10-17";

  it("is read when opened after its last change", () => {
    expect(articleReadStatus("2026-09-28", "2026-11-08T10:00:00.000Z", since)).toBe("read");
    expect(articleReadStatus("2026-11-08", "2026-11-08T10:00:00.000Z", since)).toBe("read");
  });

  it("is updated when changed after the last reading", () => {
    expect(articleReadStatus("2026-11-20", "2026-11-08T10:00:00.000Z", since)).toBe("updated");
  });

  it("is new when never opened and changed recently", () => {
    expect(articleReadStatus("2026-11-07", undefined, since)).toBe("new");
  });

  it("stays a plain unread article when older than the account", () => {
    expect(articleReadStatus("2026-04-07", undefined, since)).toBe("unread");
  });
});

describe("countUnseenArticles", () => {
  it("counts new and updated articles only", () => {
    const statuses = articleStatuses(
      [
        { slug: "ancien" },
        { slug: "recent", publishedAt: "2026-11-07", lastReviewedAt: "2026-11-07" },
        { slug: "lu", publishedAt: "2026-11-07", lastReviewedAt: "2026-11-07" },
        { slug: "revu", publishedAt: "2026-09-01", lastReviewedAt: "2026-11-20" },
      ],
      {
        accountCreatedAt: "2026-11-01T08:00:00.000Z",
        reads: [
          { slug: "lu", readAt: "2026-11-07T20:00:00.000Z" },
          { slug: "revu", readAt: "2026-11-10T20:00:00.000Z" },
        ],
      },
      FALLBACK,
    );
    expect(Object.fromEntries(statuses)).toEqual({
      ancien: "unread",
      recent: "new",
      lu: "read",
      revu: "updated",
    });
    expect(countUnseenArticles(statuses)).toBe(2);
  });
});
