import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader } from "./shared";

// TODO: couverture animée de l'article « tdah-ecrans-ne-causent-pas ».
const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
    <CoverBackdrop />
    <CoverHeader kicker="À faire" title="tdah-ecrans-ne-causent-pas" />
    <CoverFooter sources="sources à préciser" />
  </AbsoluteFill>
);

export default Cover;
