import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";
import { CoverBackdrop, CoverFooter, CoverHeader } from "./shared";

// TODO: couverture animée de l'article « medication-tdah-mythes-parents ».
const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: colors.cream, fontFamily: fonts.sans, color: colors.ink }}>
    <CoverBackdrop />
    <CoverHeader kicker="À faire" title="medication-tdah-mythes-parents" />
    <CoverFooter sources="sources à préciser" />
  </AbsoluteFill>
);

export default Cover;
