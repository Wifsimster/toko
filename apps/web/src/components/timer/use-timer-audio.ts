import { useEffect } from "react";

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext ??
    null
  );
}

type AlarmNote = { freq: number; durMs: number };

const ALARM_MELODY: AlarmNote[] = [
  { freq: 880, durMs: 200 },
  { freq: 1109, durMs: 200 },
  { freq: 1319, durMs: 200 },
  { freq: 1109, durMs: 200 },
  { freq: 0, durMs: 120 },
  { freq: 880, durMs: 200 },
  { freq: 1319, durMs: 200 },
  { freq: 1109, durMs: 220 },
  { freq: 880, durMs: 480 },
  { freq: 0, durMs: 220 },
];
const ALARM_REPEATS = 2;

export function useTimerAudio(
  audioCtxRef: React.MutableRefObject<AudioContext | null>
) {
  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, []); // eslint-disable-line react-doctor/exhaustive-deps -- ref intentionally read at unmount to release a lazily-created resource

  const primeAudio = () => {
    if (!audioCtxRef.current) {
      const Ctx = getAudioContextCtor();
      if (!Ctx) return;
      try {
        audioCtxRef.current = new Ctx();
      } catch {
        return;
      }
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
  };

  const playFinishedChime = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    let cursor = ctx.currentTime + 0.02;
    for (let r = 0; r < ALARM_REPEATS; r++) {
      for (const { freq, durMs } of ALARM_MELODY) {
        const seconds = durMs / 1000;
        if (freq > 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.value = freq;
          const peak = 0.28;
          gain.gain.setValueAtTime(0.0001, cursor);
          gain.gain.exponentialRampToValueAtTime(peak, cursor + 0.015);
          gain.gain.setValueAtTime(
            peak,
            cursor + Math.max(0.02, seconds - 0.05)
          );
          gain.gain.exponentialRampToValueAtTime(0.0001, cursor + seconds);
          osc.connect(gain).connect(ctx.destination);
          osc.start(cursor);
          osc.stop(cursor + seconds + 0.02);
        }
        cursor += seconds;
      }
    }
  };

  return { primeAudio, playFinishedChime };
}
