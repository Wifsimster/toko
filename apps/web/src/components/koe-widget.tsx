import { KoeWidget as KoeWidgetBase } from "@wifsimster/koe";
import "@wifsimster/koe/style.css";
import { create } from "zustand";
import { useSession } from "@/lib/auth-client";
import { useKoeHash } from "@/hooks/use-koe-hash";

const apiUrl = import.meta.env.VITE_KOE_API_URL;
const projectKey = import.meta.env.VITE_KOE_PROJECT_KEY;

interface KoeWidgetState {
  openCount: number;
  openKoe: () => void;
}

const useKoeWidgetStore = create<KoeWidgetState>((set) => ({
  openCount: 0,
  openKoe: () => set((s) => ({ openCount: s.openCount + 1 })),
}));

export function useKoeTrigger() {
  const openKoe = useKoeWidgetStore((s) => s.openKoe);
  const session = useSession();
  const user = session.data?.user;
  const { data: hashData } = useKoeHash(Boolean(user && apiUrl && projectKey));
  const available = Boolean(apiUrl && projectKey && user && hashData?.hash);
  return { openKoe, available };
}

export function KoeWidget() {
  const session = useSession();
  const user = session.data?.user;
  const { data: hashData } = useKoeHash(Boolean(user && apiUrl && projectKey));
  const openCount = useKoeWidgetStore((s) => s.openCount);

  if (!apiUrl || !projectKey || !user || !hashData?.hash) return null;

  return (
    <KoeWidgetBase
      key={openCount}
      projectKey={projectKey}
      apiUrl={apiUrl}
      user={{ id: user.id, name: user.name, email: user.email }}
      userHash={hashData.hash}
      position="bottom-right"
      theme={{ accentColor: "#c2410c", mode: "auto" }}
      defaultOpen={openCount > 0}
    />
  );
}
