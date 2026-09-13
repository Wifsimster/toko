import { useState, useEffect, useCallback, useRef, useEffectEvent } from "react";

import { useTranslation } from "react-i18next";

import {
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CrisisItem } from "@focusflow/validators";

/**
 * The full-screen view a parent opens mid-crisis: one strategy at a time,
 * swipeable, nothing else on screen. Everything here is in service of a
 * reader who has no attention to spare.
 */

function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swiping = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]!.clientX;
    touchStartY.current = e.touches[0]!.clientY;
    swiping.current = true;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swiping.current) return;
      swiping.current = false;

      const deltaX = e.changedTouches[0]!.clientX - touchStartX.current;
      const deltaY = e.changedTouches[0]!.clientY - touchStartY.current;

      if (Math.abs(deltaX) < 50 || Math.abs(deltaY) > Math.abs(deltaX)) return;

      if (deltaX < 0) onSwipeLeft();
      else onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchEnd };
}

export function CrisisView({
  items,
  onClose,
}: {
  items: CrisisItem[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const item = items[currentIndex]!;

  const goNext = useCallback(() => {
    if (currentIndex >= items.length - 1) return;
    setDirection("left");
    setCurrentIndex((i) => i + 1);
  }, [currentIndex, items.length]);

  const goPrev = useCallback(() => {
    if (currentIndex <= 0) return;
    setDirection("right");
    setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  useEffect(() => {
    if (direction) {
      const timeout = setTimeout(() => setDirection(null), 300);
      return () => clearTimeout(timeout);
    }
  }, [direction, currentIndex]);

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "ArrowRight") goNext();
    else if (e.key === "ArrowLeft") goPrev();
    else if (e.key === "Escape") onClose();
  });
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const swipe = useSwipe(goNext, goPrev);

  return (
    <div
      className="fixed inset-0 z-50 flex touch-pan-y select-none flex-col items-center justify-center bg-gradient-to-b from-accent-50 via-background to-sage-50 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] dark:from-accent-900/30 dark:via-background dark:to-sage-900/30"
      {...swipe}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("crisis.closeCrisisMode")}
        className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10 flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
      >
        <X className="size-6" />
      </button>

      <nav
        aria-label={t("crisis.activitiesNav")}
        className="absolute top-[max(1.5rem,calc(env(safe-area-inset-top)+0.5rem))] left-1/2 flex -translate-x-1/2 gap-2"
      >
        {items.map((crisisItem, i) => (
          <button
            type="button"
            key={crisisItem.id}
            onClick={() => {
              setDirection(i > currentIndex ? "left" : "right");
              setCurrentIndex(i);
            }}
            aria-label={t("crisis.activityLabel", {
              index: i + 1,
              label: crisisItem.label,
            })}
            aria-current={i === currentIndex ? "step" : undefined}
            className="flex size-8 items-center justify-center rounded-full"
          >
            <span
              className={`block size-2.5 rounded-full transition-all ${
                i === currentIndex
                  ? "scale-125 bg-primary"
                  : "bg-primary/30"
              }`}
            />
          </button>
        ))}
      </nav>

      <div
        key={currentIndex}
        className={`flex flex-col items-center gap-6 px-8 text-center ${
          direction === "left"
            ? "animate-slide-in-right"
            : direction === "right"
              ? "animate-slide-in-left"
              : ""
        }`}
      >
        <span className="text-6xl sm:text-7xl animate-pulse">
          {item.emoji || "💙"}
        </span>
        <p className="max-w-md text-2xl font-semibold leading-relaxed text-foreground sm:text-3xl">
          {item.label}
        </p>
        <p className="text-sm text-muted-foreground">
          {currentIndex + 1} / {items.length}
        </p>
      </div>

      <p className="absolute bottom-20 text-xs text-muted-foreground/50 sm:hidden">
        {t("crisis.swipeHint")}
      </p>

      <nav
        className="absolute bottom-8 hidden gap-4 sm:flex"
        aria-label={t("crisis.prevNextNav")}
      >
        <Button
          variant="ghost"
          size="lg"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label={t("crisis.prevActivity")}
          className="size-14 rounded-full"
        >
          <ChevronLeft className="size-6" />
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={goNext}
          disabled={currentIndex === items.length - 1}
          aria-label={t("crisis.nextActivity")}
          className="size-14 rounded-full"
        >
          <ChevronRight className="size-6" />
        </Button>
      </nav>
    </div>
  );
}
