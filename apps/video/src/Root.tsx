import { Composition } from "remotion";
import { Promo, PROMO_DURATION } from "./Promo";
import { FPS } from "./theme";
import { COVER_FPS, COVER_SECONDS, RetoursEnseignantCover } from "./covers/RetoursEnseignant";
import { COVERS } from "./covers/registry";
import { COVER_HEIGHT, COVER_WIDTH } from "./covers/shared";

export const Root: React.FC = () => (
  <>
    <Composition id="TokoPromo" component={Promo} durationInFrames={PROMO_DURATION} fps={FPS} width={1920} height={1080} />
    <Composition id="TokoPromoSquare" component={Promo} durationInFrames={PROMO_DURATION} fps={FPS} width={1080} height={1080} />
    <Composition
      id="CoverRetoursEnseignant"
      component={RetoursEnseignantCover}
      durationInFrames={COVER_FPS * COVER_SECONDS}
      fps={COVER_FPS}
      width={928}
      height={1152}
    />
    {COVERS.map(({ slug, component }) => (
      <Composition
        key={slug}
        id={`cover-${slug}`}
        component={component}
        durationInFrames={COVER_FPS * COVER_SECONDS}
        fps={COVER_FPS}
        width={COVER_WIDTH}
        height={COVER_HEIGHT}
      />
    ))}
  </>
);
