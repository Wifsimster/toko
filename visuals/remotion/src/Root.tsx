import React from 'react';
import {Composition} from 'remotion';
import {Attention, Clarity, Overlap, Path, Sensory, Wave} from './loops';
import * as crise from './ressources/crise';
import * as dysregulation from './ressources/dysregulation';
import * as coRegulation from './ressources/co-regulation';
import * as deconnexion from './ressources/deconnexion';
import * as fonctionsExecutives from './ressources/fonctions-executives';
import * as hypersensibilite from './ressources/hypersensibilite';
import * as sommeil from './ressources/sommeil';
import * as grandsParents from './ressources/grands-parents';
import * as coParent from './ressources/co-parent';
import * as parrains from './ressources/parrains';
import * as parcours from './ressources/parcours';
import * as medication from './ressources/medication';
import * as ecrans from './ressources/ecrans';
import * as motivation from './ressources/motivation';
import * as parentCrises from './ressources/parent-crises';
import * as rentree from './ressources/rentree';
import * as equine from './ressources/equine';
import * as formation from './formation';

// Une composition par boucle et par thème : `<nom>-<thème>` (noms uniques),
// rendue dans apps/web/public/visuals/<slug>/. fps bas = fichier plus léger ;
// `still` = instant (0-1) gardé pour l'image fixe (prefers-reduced-motion).
// Quiz Repères : boucles de 3 s (./loops) ; articles /ressources : boucles
// de 4 s aux mouvements plus lents (./ressources), slug = celui de l'article.
const LOOPS = [
  {slug: 'quiz', name: 'clarity', component: Clarity, fps: 12, still: 0.55, seconds: 3},
  {slug: 'quiz', name: 'attention', component: Attention, fps: 15, still: 0.25, seconds: 3},
  {slug: 'quiz', name: 'wave', component: Wave, fps: 10, still: 0.8, seconds: 3},
  {slug: 'quiz', name: 'sensory', component: Sensory, fps: 15, still: 0.55, seconds: 3},
  {slug: 'quiz', name: 'overlap', component: Overlap, fps: 10, still: 0.55, seconds: 3},
  {slug: 'quiz', name: 'path', component: Path, fps: 15, still: 0.8, seconds: 3},
  {slug: 'crise-tdah-enfant-guide-complet', name: 'phases', component: crise.Phases, fps: 10, still: 0.43, seconds: 4},
  {slug: 'crise-tdah-enfant-guide-complet', name: 'fewer', component: crise.Fewer, fps: 15, still: 0.8, seconds: 4},
  {slug: 'dysregulation-emotionnelle-tdah', name: 'alarm', component: dysregulation.Alarm, fps: 15, still: 0.83, seconds: 4},
  {slug: 'dysregulation-emotionnelle-tdah', name: 'circle', component: dysregulation.Circle, fps: 8, still: 0.13, seconds: 4},
  {slug: 'co-regulation-parent-enfant-tdah', name: 'sync', component: coRegulation.Sync, fps: 8, still: 0.4, seconds: 4},
  {slug: 'co-regulation-parent-enfant-tdah', name: 'repair', component: coRegulation.Repair, fps: 12, still: 0.53, seconds: 4},
  {slug: 'deconnexion-emotionnelle-tdah', name: 'freeze', component: deconnexion.Freeze, fps: 12, still: 0.57, seconds: 4},
  {slug: 'deconnexion-emotionnelle-tdah', name: 'overload', component: deconnexion.Overload, fps: 12, still: 0.5, seconds: 4},
  {slug: 'fonctions-executives-tdah-enfant', name: 'six', component: fonctionsExecutives.Six, fps: 12, still: 0.03, seconds: 4},
  {slug: 'fonctions-executives-tdah-enfant', name: 'tray', component: fonctionsExecutives.Tray, fps: 10, still: 0.17, seconds: 4},
  {slug: 'hypersensibilite-sensorielle-tdah', name: 'channels', component: hypersensibilite.Channels, fps: 10, still: 0.2, seconds: 4},
  {slug: 'hypersensibilite-sensorielle-tdah', name: 'filter', component: hypersensibilite.Filter, fps: 8, still: 0.0, seconds: 4},
  {slug: 'troubles-sommeil-tdah-enfant', name: 'clock', component: sommeil.Clock, fps: 8, still: 0.17, seconds: 4},
  {slug: 'troubles-sommeil-tdah-enfant', name: 'lights', component: sommeil.Lights, fps: 12, still: 0.73, seconds: 4},
  {slug: 'mini-guide-grands-parents-tdah', name: 'unsaid', component: grandsParents.Unsaid, fps: 12, still: 0.73, seconds: 4},
  {slug: 'mini-guide-grands-parents-tdah', name: 'presence', component: grandsParents.Presence, fps: 12, still: 0.67, seconds: 4},
  {slug: 'mini-guide-co-parent-tdah', name: 'two-homes', component: coParent.TwoHomes, fps: 12, still: 0.03, seconds: 4},
  {slug: 'mini-guide-co-parent-tdah', name: 'relay', component: coParent.Relay, fps: 12, still: 0.33, seconds: 4},
  {slug: 'mini-guide-parrains-marraines-tdah', name: 'join', component: parrains.Join, fps: 12, still: 0.67, seconds: 4},
  {slug: 'mini-guide-parrains-marraines-tdah', name: 'recharge', component: parrains.Recharge, fps: 12, still: 0.73, seconds: 4},
  {slug: 'apres-le-diagnostic-tdah-parcours-de-soins', name: 'steps', component: parcours.Path, fps: 10, still: 0.57, seconds: 4},
  {slug: 'apres-le-diagnostic-tdah-parcours-de-soins', name: 'not-alone', component: parcours.NotAlone, fps: 8, still: 0.77, seconds: 4},
  {slug: 'medication-tdah-mythes-parents', name: 'adjust', component: medication.Adjust, fps: 12, still: 0.8, seconds: 4},
  {slug: 'medication-tdah-mythes-parents', name: 'together', component: medication.Together, fps: 10, still: 0.17, seconds: 4},
  {slug: 'tdah-ecrans-ne-causent-pas', name: 'helix', component: ecrans.Helix, fps: 8, still: 0.0, seconds: 4},
  {slug: 'tdah-ecrans-ne-causent-pas', name: 'timer', component: ecrans.Timer, fps: 12, still: 0.33, seconds: 4},
  {slug: 'motivation-delai-tdah-pourquoi-punition-echoue', name: 'delay', component: motivation.Delay, fps: 12, still: 0.33, seconds: 4},
  {slug: 'motivation-delai-tdah-pourquoi-punition-echoue', name: 'jar', component: motivation.Jar, fps: 12, still: 0.83, seconds: 4},
  {slug: 'parent-tdah-gerer-mes-propres-crises', name: 'hourglass', component: parentCrises.Hourglass, fps: 12, still: 0.4, seconds: 4},
  {slug: 'parent-tdah-gerer-mes-propres-crises', name: 'breathe', component: parentCrises.Breathe, fps: 8, still: 0.5, seconds: 4},
  {slug: 'rentree-scolaire-tdah-enfant', name: 'bag', component: rentree.Bag, fps: 12, still: 0.8, seconds: 4},
  {slug: 'rentree-scolaire-tdah-enfant', name: 'one-at-a-time', component: rentree.OneAtATime, fps: 12, still: 0.17, seconds: 4},
  {slug: 'mediation-equine-equitation-tdah-enfant', name: 'gait', component: equine.Gait, fps: 10, still: 0.0, seconds: 4},
  {slug: 'mediation-equine-equitation-tdah-enfant', name: 'horseshoe', component: equine.Horseshoe, fps: 12, still: 0.25, seconds: 4},
  // Page /formation : hero, les trois blocs du programme, la pratique dans l'app.
  {slug: 'formation', name: 'ten-steps', component: formation.TenSteps, fps: 12, still: 0.8, seconds: 4},
  {slug: 'formation', name: 'understand', component: formation.Understand, fps: 12, still: 0.5, seconds: 4},
  {slug: 'formation', name: 'act', component: formation.Act, fps: 12, still: 0.75, seconds: 4},
  {slug: 'formation', name: 'anchor', component: formation.Anchor, fps: 12, still: 0.6, seconds: 4},
  {slug: 'formation', name: 'practice', component: formation.Practice, fps: 12, still: 0.8, seconds: 4},
];

export const Root: React.FC = () => (
  <>
    {LOOPS.flatMap(({slug, name, component, fps, still, seconds}) =>
      (['light', 'dark'] as const).map((theme) => (
        <Composition
          key={`${name}-${theme}`}
          id={`${name}-${theme}`}
          component={component as React.FC<{theme: 'light' | 'dark'; still: number}>}
          durationInFrames={seconds * fps}
          fps={fps}
          width={480}
          height={240}
          defaultProps={{theme, slug, still}}
        />
      )),
    )}
  </>
);
