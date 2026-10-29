export function SectionLoop({
  slug,
  name,
  className = "my-6",
  width = "max-w-[360px]",
  eager = false,
}: {
  slug: string;
  name: string;
  className?: string;
  width?: string;
  eager?: boolean;
}) {
  const base = `/visuals/${slug}/${name}`;
  return (
    <figure className={`${className} flex justify-center`} aria-hidden="true">
      <picture className={`block w-full ${width}`}>
        <source media="(prefers-reduced-motion: reduce)" srcSet={`${base}-light.png`} />
        <img
          src={`${base}-light.webp`}
          alt=""
          width={480}
          height={240}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-auto w-full"
        />
      </picture>
    </figure>
  );
}
