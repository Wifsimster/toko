import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import {
  ChevronRight,
  ClipboardList,
  Flame,
  Minus,
  SmilePlus,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";

import { fonts } from "./ui";
import { homeStats as copy } from "../lib/copy";
import {
  areaPath,
  chartGeometry,
  chartSummary,
  consistencyTone,
  linePath,
  moodLabelFor,
  valueOrDash,
  weekdayShortFr,
  type BarkleyProgress,
  type ChartPoint,
  type ChartSeriesKey,
  type ConsistencyTone,
  type MoodTrend,
} from "../lib/home-stats";
import { useTheme, type Palette } from "../lib/theme";

function Indicator({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  valueColor,
  trend,
  ariaLabel,
  onPress,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  valueColor: string;
  trend?: MoodTrend;
  ariaLabel: string;
  onPress: () => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : trend === "stable" ? Minus : null;
  const trendLabel =
    trend === "up"
      ? copy.trendUp
      : trend === "down"
        ? copy.trendDown
        : trend === "stable"
          ? copy.trendStable
          : null;
  const trendColor = trend === "up" ? c.successFg : trend === "down" ? c.dangerFg : c.muted;

  return (
    <Pressable
      onPress={onPress}
      style={s.tile}
      accessibilityRole="button"
      accessibilityLabel={`${title} : ${value}. ${subtitle}. ${ariaLabel}`}
    >
      <View style={s.tileHead}>
        <Text style={s.tileTitle} numberOfLines={3}>
          {title}
        </Text>
        <Icon size={16} color={iconColor} />
      </View>
      <Text style={[s.tileValue, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {TrendIcon && trendLabel ? (
        <View style={s.trendRow} accessibilityLabel={copy.trendAria(trendLabel)}>
          <TrendIcon size={12} color={trendColor} />
          <Text style={[s.trendText, { color: trendColor }]} numberOfLines={1}>
            {trendLabel}
          </Text>
        </View>
      ) : null}
      <Text style={s.tileSub} numberOfLines={3}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

function toneColor(c: Palette, tone: ConsistencyTone) {
  if (tone === "good") return c.successFg;
  if (tone === "mid") return c.alertFg;
  if (tone === "low") return c.dangerFg;
  return c.muted;
}

export function HomeIndicators({
  consistencyScore,
  weeklyStars,
  latestMood,
  moodTrend,
  onConsistency,
  onStars,
  onMood,
}: {
  consistencyScore: number | null | undefined;
  weeklyStars: number | undefined;
  latestMood: number | null | undefined;
  moodTrend: MoodTrend | undefined;
  onConsistency: () => void;
  onStars: () => void;
  onMood: () => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={s.tiles}>
      <Indicator
        title={copy.consistency}
        value={valueOrDash(consistencyScore)}
        subtitle={copy.consistencySubtitle}
        icon={Target}
        iconColor={toneColor(c, consistencyTone(consistencyScore))}
        valueColor={toneColor(c, consistencyTone(consistencyScore))}
        ariaLabel={copy.consistencyAria}
        onPress={onConsistency}
      />
      <Indicator
        title={copy.stars}
        value={valueOrDash(weeklyStars)}
        subtitle={copy.starsSubtitle}
        icon={Star}
        iconColor={c.alertFg}
        valueColor={c.text}
        ariaLabel={copy.starsAria}
        onPress={onStars}
      />
      <Indicator
        title={copy.mood}
        value={moodLabelFor(latestMood) ?? "—"}
        subtitle={copy.moodSubtitle}
        icon={SmilePlus}
        iconColor={c.brandStrong}
        valueColor={c.text}
        trend={moodTrend ?? null}
        ariaLabel={copy.moodAria}
        onPress={onMood}
      />
    </View>
  );
}

const CHART_HEIGHT = 140;
const SERIES: ReadonlyArray<{ key: ChartSeriesKey; label: string }> = [
  { key: "mood", label: copy.seriesMood },
  { key: "focus", label: copy.seriesFocus },
  { key: "agitation", label: copy.seriesAgitation },
];

export function HomeWeekChart({ data }: { data: ReadonlyArray<ChartPoint> | undefined }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const [width, setWidth] = useState(0);
  const colorOf: Record<ChartSeriesKey, string> = {
    mood: c.brand,
    focus: c.chartSage,
    agitation: c.danger,
  };
  const hasData = !!data && data.length > 0;
  const geo = useMemo(
    () => (hasData && width > 0 ? chartGeometry(data, width, CHART_HEIGHT, weekdayShortFr) : null),
    [data, hasData, width],
  );

  return (
    <View style={s.chartCard}>
      <Text style={s.chartTitle} accessibilityRole="header">
        {copy.chartTitle}
      </Text>
      {hasData ? (
        <>
          <View
            style={s.chartBox}
            onLayout={(e) => setWidth(Math.floor(e.nativeEvent.layout.width))}
            accessible
            accessibilityRole="image"
            accessibilityLabel={`${copy.chartTitle}. ${chartSummary(data)}`}
          >
            {geo ? (
              <Svg width={width} height={CHART_HEIGHT} pointerEvents="none">
                {[0, 5, 10].map((v) => {
                  const y = CHART_HEIGHT - (v / 10) * CHART_HEIGHT;
                  return (
                    <Line
                      key={v}
                      x1={0}
                      x2={width}
                      y1={y}
                      y2={y}
                      stroke={c.border}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  );
                })}
                {SERIES.map(({ key }) => (
                  <Path
                    key={`${key}-area`}
                    d={areaPath(geo.series[key], CHART_HEIGHT)}
                    fill={colorOf[key]}
                    fillOpacity={0.15}
                  />
                ))}
                {SERIES.map(({ key }) => (
                  <Path
                    key={`${key}-line`}
                    d={linePath(geo.series[key])}
                    stroke={colorOf[key]}
                    strokeWidth={2}
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
                {SERIES.map(({ key }) =>
                  geo.series[key].map((p, i) => (
                    <Circle key={`${key}-${i}`} cx={p.x} cy={p.y} r={3} fill={colorOf[key]} />
                  )),
                )}
              </Svg>
            ) : null}
          </View>
          <View style={s.axis} importantForAccessibility="no-hide-descendants">
            {data.map((p) => (
              <Text key={p.date} style={s.axisLabel}>
                {weekdayShortFr(p.date)}
              </Text>
            ))}
          </View>
          <View style={s.legend} importantForAccessibility="no-hide-descendants">
            {SERIES.map(({ key, label }) => (
              <View key={key} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: colorOf[key] }]} />
                <Text style={s.legendText}>{label}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={s.chartEmpty}>
          <Text style={s.chartEmptyText}>{copy.chartEmpty}</Text>
        </View>
      )}
    </View>
  );
}

export function HomeBarkleyCard({
  progress,
  onPress,
}: {
  progress: BarkleyProgress | null;
  onPress: () => void;
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  if (!progress) return null;
  return (
    <Pressable
      onPress={onPress}
      style={s.barkley}
      accessibilityRole="button"
      accessibilityLabel={copy.barkleyAria(progress.current, progress.total)}
    >
      <View style={s.barkleyHead}>
        <ClipboardList size={16} color={c.muted} />
        <Text style={s.barkleyTitle}>{copy.barkleyTitle}</Text>
        <ChevronRight size={20} color={c.chevron} />
      </View>
      <View style={s.barkleyStepRow}>
        <Flame size={16} color={c.alertFg} />
        <Text style={s.barkleyStep}>{copy.barkleyStep(progress.current, progress.total)}</Text>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${progress.ratio * 100}%` }]} />
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    tiles: { flexDirection: "row", gap: 8, alignItems: "stretch" },
    tile: {
      flex: 1,
      minHeight: 44,
      gap: 4,
      padding: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    tileHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 4 },
    tileTitle: { flex: 1, fontSize: 12, lineHeight: 15, color: c.muted, fontFamily: fonts.medium },
    tileValue: { fontSize: 24, lineHeight: 30, fontFamily: fonts.bold, fontVariant: ["tabular-nums"] },
    trendRow: { flexDirection: "row", alignItems: "center", gap: 3 },
    trendText: { fontSize: 12, fontFamily: fonts.medium },
    tileSub: { fontSize: 11, lineHeight: 14, color: c.muted, fontFamily: fonts.body },
    chartCard: {
      gap: 10,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    chartTitle: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    chartBox: { height: CHART_HEIGHT },
    axis: { flexDirection: "row", justifyContent: "space-between" },
    axisLabel: { flex: 1, textAlign: "center", fontSize: 11, color: c.muted, fontFamily: fonts.medium },
    legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, color: c.subtext, fontFamily: fonts.medium },
    chartEmpty: { minHeight: 96, alignItems: "center", justifyContent: "center" },
    chartEmptyText: { fontSize: 14, color: c.muted, fontFamily: fonts.body, textAlign: "center" },
    barkley: {
      gap: 8,
      minHeight: 56,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    barkleyHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    barkleyTitle: { flex: 1, fontSize: 14, color: c.muted, fontFamily: fonts.medium },
    barkleyStepRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    barkleyStep: { fontSize: 15, color: c.text, fontFamily: fonts.semibold },
    track: { height: 6, borderRadius: 3, backgroundColor: c.mutedSurface, overflow: "hidden" },
    fill: { height: 6, borderRadius: 3, backgroundColor: c.brand },
  });
