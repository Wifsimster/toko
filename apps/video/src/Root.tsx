import { Composition } from "remotion";
import { Promo, PROMO_DURATION } from "./Promo";
import { FPS } from "./theme";

export const Root: React.FC = () => (
  <>
    {/* 16:9 — YouTube, site web, présentations */}
    <Composition id="TokoPromo" component={Promo} durationInFrames={PROMO_DURATION} fps={FPS} width={1920} height={1080} />
    {/* 1:1 — réseaux sociaux */}
    <Composition id="TokoPromoSquare" component={Promo} durationInFrames={PROMO_DURATION} fps={FPS} width={1080} height={1080} />
  </>
);
