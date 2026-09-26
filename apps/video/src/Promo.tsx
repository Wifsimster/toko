import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Feature, type FeatureProps } from "./scenes/Feature";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Overload } from "./scenes/Overload";
import { Pledge } from "./scenes/Pledge";
import { CrisisScreen, JournalScreen, RewardsScreen, TrackingScreen } from "./scenes/screens";
import { Trust } from "./scenes/Trust";

const FEATURES: Omit<FeatureProps, "step">[] = [
  {
    kicker: "Journal",
    title: "Notez la journée en une minute",
    body: "Une humeur, quelques mots, c'est fait.",
    screenTitle: "Journal",
    Screen: JournalScreen,
  },
  {
    kicker: "Suivi",
    title: "Voyez ce qui change",
    body: "7 repères simples et des tendances claires, à montrer au médecin.",
    screenTitle: "Suivi du jour",
    Screen: TrackingScreen,
  },
  {
    kicker: "Plan de crise",
    title: "Un plan prêt pour les moments difficiles",
    body: "Des activités apaisantes, choisies avec votre enfant.",
    screenTitle: "Plan de crise",
    Screen: CrisisScreen,
  },
  {
    kicker: "Récompenses",
    title: "Encouragez chaque progrès",
    body: "Étoiles et récompenses, inspirées du programme Barkley.",
    screenTitle: "Cette semaine",
    Screen: RewardsScreen,
  },
];

// Durées en images (30 i/s). Transitions en fondu, lentes, sans effet brusque.
const T = 15;
const SCENES: { duration: number; node: React.ReactNode }[] = [
  { duration: 80, node: <Intro /> },
  { duration: 150, node: <Overload /> },
  { duration: 95, node: <Pledge /> },
  ...FEATURES.map((f, i) => ({ duration: 135, node: <Feature step={i + 1} {...f} /> })),
  { duration: 130, node: <Trust /> },
  { duration: 135, node: <Outro /> },
];

export const PROMO_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0) - T * (SCENES.length - 1);

export const Promo: React.FC = () => (
  <TransitionSeries>
    {SCENES.flatMap((scene, i) => [
      ...(i > 0 ? [<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={linearTiming({ durationInFrames: T })} />] : []),
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={scene.duration}>
        {scene.node}
      </TransitionSeries.Sequence>,
    ])}
  </TransitionSeries>
);
