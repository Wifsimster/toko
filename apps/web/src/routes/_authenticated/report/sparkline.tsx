/**
 * Minimal SVG sparkline. No dependencies.
 * Values expected in 1-5 range (symptom scale).
 */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <span className="text-xs text-muted-foreground/60">, </span>;
  }
  const width = 80;
  const height = 20;
  const min = 1;
  const max = 5;
  const stepX = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / (max - min)) * height;
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
