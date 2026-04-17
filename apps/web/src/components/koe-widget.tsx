import { KoeWidget as KoeWidgetBase } from "@wifsimster/koe";
import "@wifsimster/koe/style.css";
import { useSession } from "@/lib/auth-client";
import { useKoeHash } from "@/hooks/use-koe-hash";

const apiUrl = import.meta.env.VITE_KOE_API_URL;
const projectKey = import.meta.env.VITE_KOE_PROJECT_KEY;

export function KoeWidget() {
  const session = useSession();
  const user = session.data?.user;
  const { data: hashData } = useKoeHash(Boolean(user && apiUrl && projectKey));

  if (!apiUrl || !projectKey || !user || !hashData?.hash) return null;

  return (
    <KoeWidgetBase
      projectKey={projectKey}
      apiUrl={apiUrl}
      user={{ id: user.id, name: user.name, email: user.email }}
      userHash={hashData.hash}
      position="bottom-right"
      theme={{ accentColor: "#c2410c", mode: "auto" }}
    />
  );
}
