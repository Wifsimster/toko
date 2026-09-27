import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader } from "./shared";

// TODO: couverture animée de l'article « crise-tdah-enfant-guide-complet ».
const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
    <CoverBackdrop />
    <CoverHeader kicker="À faire" title="crise-tdah-enfant-guide-complet" />
    <CoverFooter sources="sources à préciser" />
  </AbsoluteFill>
);

export default Cover;
