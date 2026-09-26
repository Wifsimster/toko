import React from 'react';
import {Composition} from 'remotion';
import {LOOP} from './common';
import {Attention, Clarity, Overlap, Path, Sensory, Wave} from './loops';

// Une composition par boucle et par thème : `<nom>-<thème>`.
// fps bas = fichier plus léger ; `still` = instant (0-1) gardé pour l'image fixe.
const LOOPS = [
  {name: 'clarity', component: Clarity, fps: 12, still: 0.55},
  {name: 'attention', component: Attention, fps: 15, still: 0.25},
  {name: 'wave', component: Wave, fps: 10, still: 0.8},
  {name: 'sensory', component: Sensory, fps: 15, still: 0.55},
  {name: 'overlap', component: Overlap, fps: 10, still: 0.55},
  {name: 'path', component: Path, fps: 15, still: 0.8},
];

export const Root: React.FC = () => (
  <>
    {LOOPS.flatMap(({name, component, fps, still}) =>
      (['light', 'dark'] as const).map((theme) => (
        <Composition
          key={`${name}-${theme}`}
          id={`${name}-${theme}`}
          component={component}
          durationInFrames={LOOP.seconds * fps}
          fps={fps}
          width={LOOP.width}
          height={LOOP.height}
          defaultProps={{theme, still}}
        />
      )),
    )}
  </>
);
