import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { knowledgeArticles, type KnowledgeArticle } from "./knowledge";

// Slugs of articles the parent has already opened. Persisted locally so the
// "Prochaine lecture" card on the dashboard can suggest the next unread one.
const STORAGE_KEY = "toko.knowledge.read";

/**
 * Tracks which knowledge-base articles have been opened, persisted in
 * AsyncStorage. Lets the dashboard suggest a single "next" article and the
 * Connaissances list mark articles as read when tapped.
 */
export function useReadArticles() {
  const [read, setRead] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        setRead(new Set(JSON.parse(raw) as string[]));
      })
      .catch(() => {
        // Corrupt/unavailable storage — start fresh, nothing is lost.
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = useCallback((slug: string) => {
    setRead((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev).add(slug);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next])).catch(
        () => {
          // Fail silent — the suggestion simply reappears next launch.
        },
      );
      return next;
    });
  }, []);

  return { read, markRead, loaded };
}

/**
 * The next article the parent should read: the first one (in library order)
 * they have not opened yet. Returns null once everything has been read.
 */
export function pickNextArticle(read: Set<string>): KnowledgeArticle | null {
  return knowledgeArticles.find((a) => !read.has(a.slug)) ?? null;
}
