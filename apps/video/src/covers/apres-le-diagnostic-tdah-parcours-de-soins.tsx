import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader } from "./shared";

// TODO: couverture animée de l'article « apres-le-diagnostic-tdah-parcours-de-soins ».
const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
    <CoverBackdrop />
    <CoverHeader kicker="À faire" title="apres-le-diagnostic-tdah-parcours-de-soins" />
    <CoverFooter sources="sources à préciser" />
  </AbsoluteFill>
);

export default Cover;
