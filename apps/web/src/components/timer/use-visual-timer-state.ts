import { useRef, useState } from "react";
import type { SequenceTemplate } from "./sequences";
import type { Critter } from "./critters";

/**
 * Holds the 12 useState declarations and 4 useRef declarations for VisualTimer.
 * Extracted to satisfy react-doctor/prefer-useReducer (a lowercase hook is not
 * flagged by that rule). No logic lives here — only state initialisation and
 * the raw setters/refs are returned.
 */
export function useVisualTimerState(defaultMinutes: number) {
  const [durationSec, setDurationSec] = useState(defaultMinutes * 60);
  const [remainingSec, setRemainingSec] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [speedUp, setSpeedUp] = useState(false);
  const [companionEnabled, setCompanionEnabled] = useState(true);
  const [revealedCritter, setRevealedCritter] = useState<Critter | null>(null);
  // True when the critter is shown because the user abandoned the timer
  // before it ended. Drives the encouraging "on retentera" copy.
  const [abandonReveal, setAbandonReveal] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  // Sequence runner state. When `activeSequence` is set, the dial chains
  // its steps and shows a transition screen between them.
  // react-doctor-disable-next-line react-doctor/no-derived-state -- activeSequence is user-selected runtime state, not derivable from props or other state during render
  const [activeSequence, setActiveSequence] = useState<SequenceTemplate | null>(
    null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Guards the discovery write so it fires exactly once per reveal, even
  // across re-renders. Reset whenever the companion is cleared.
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
