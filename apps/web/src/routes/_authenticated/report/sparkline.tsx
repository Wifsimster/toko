/**
 * Minimal SVG sparkline. No dependencies.
 * Values expected in the 0-10 symptom scale (see ratingScale in
 * @focusflow/validators and the 0-10 slider in the symptom form). Values are
 * clamped so an out-of-range point can never be plotted outside the viewBox.
 */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <span className="text-xs text-muted-foreground/60">—</span>;
  }
  const width = 80;
  const height = 20;
  const min = 0;
  const max = 10;
  const stepX = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const ratio = Math.min(1, Math.max(0, (v - min) / (max - min)));
      const y = height - ratio * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="sparkline inline-block align-middle"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
