import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useArticleReads, useMarkArticleRead } from "../hooks/use-article-reads";
import { knowledgeArticles, type KnowledgeArticle } from "./knowledge";

const STORAGE_KEY = "toko.knowledge.read";

export function useReadArticles() {
  const [local, setLocal] = useState<Set<string>>(new Set());
  const { data } = useArticleReads();
  const markOnServer = useMarkArticleRead();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        setLocal(new Set(JSON.parse(raw) as string[]));
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
    markOnServer(slug);
    setLocal((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev).add(slug);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next])).catch(
        () => {
        },
      );
      return next;
    });
  }, [markOnServer]);

  const read = useMemo(() => {
    const all = new Set(local);
    for (const r of data?.reads ?? []) all.add(r.slug);
    return all;
  }, [local, data]);

  return { read, markRead, loaded };
}

export function pickNextArticle(read: Set<string>): KnowledgeArticle | null {
  return knowledgeArticles.find((a) => !read.has(a.slug)) ?? null;
}
