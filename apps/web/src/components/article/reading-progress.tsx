import { useEffect, useState } from "react";

/**
 * Barre d'avancement de lecture, posée sur le bord bas de l'en-tête collant.
 *
 * Savoir où l'on en est évite de relancer l'article « au cas où » : la barre
 * est assez épaisse pour se voir d'un coup d'œil sur un téléphone, mais reste
 * une fine ligne de couleur, sans pourcentage ni animation, pour ne pas
 * capter l'attention pendant la lecture.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      const ratio = window.scrollY / scrollable;
      setProgress(Math.min(100, Math.max(0, ratio * 100)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-1 bg-primary/15"
    >
      <div
        className="h-full bg-primary"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
