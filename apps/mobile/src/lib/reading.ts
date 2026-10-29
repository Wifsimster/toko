import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { knowledgeArticles, type KnowledgeArticle } from "./knowledge";

const STORAGE_KEY = "toko.knowledge.read";

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
        },
      );
      return next;
    });
  }, []);

  return { read, markRead, loaded };
}

export function pickNextArticle(read: Set<string>): KnowledgeArticle | null {
  return knowledgeArticles.find((a) => !read.has(a.slug)) ?? null;
}
