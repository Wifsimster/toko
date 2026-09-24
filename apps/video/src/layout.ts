import { useVideoConfig } from "remotion";

// Toutes les tailles sont pensées pour 1080 px de petit côté,
// puis mises à l'échelle pour chaque format.
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  return { u, landscape: width > height * 1.2, width, height };
};
