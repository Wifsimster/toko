import { useVideoConfig } from "remotion";

export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  return { u, landscape: width > height * 1.2, width, height };
};
