import { useRef, useState } from "react";
import type { SequenceTemplate } from "./sequences";
import type { Critter } from "./critters";

export function useVisualTimerState(defaultMinutes: number) {
  const [durationSec, setDurationSec] = useState(defaultMinutes * 60);
  const [remainingSec, setRemainingSec] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [speedUp, setSpeedUp] = useState(false);
  const [companionEnabled, setCompanionEnabled] = useState(true);
  const [revealedCritter, setRevealedCritter] = useState<Critter | null>(null);
  const [abandonReveal, setAbandonReveal] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [activeSequence, setActiveSequence] = useState<SequenceTemplate | null>(
    null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const discoveryRecordedRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const abandonTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  return {
    durationSec,
    setDurationSec,
    remainingSec,
    setRemainingSec,
    running,
    setRunning,
    fullscreen,
    setFullscreen,
    speedUp,
    setSpeedUp,
    companionEnabled,
    setCompanionEnabled,
    revealedCritter,
    setRevealedCritter,
    abandonReveal,
    setAbandonReveal,
    collectionOpen,
    setCollectionOpen,
    activeSequence,
    setActiveSequence,
    currentStepIndex,
    setCurrentStepIndex,
    transitioning,
    setTransitioning,
    discoveryRecordedRef,
    intervalRef,
    audioCtxRef,
    abandonTimeoutRef,
    transitionTimeoutRef,
  };
}
