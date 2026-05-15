import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import {
  useAgentKeys,
  useCreateAgentKey,
  useRevokeAgentKey,
  type CreatedAgentKey,
} from "@/hooks/use-agent-keys";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Section "Développeurs" de Tokō. Page publique, accessible depuis le pied
// de page. Elle permet à un parent de connecter son propre assistant IA
// (en lecture seule) à ses données de suivi via le serveur MCP Tokō.
//
// Le contenu est volontairement rédigé en français directement dans le JSX :
// la cible est le parent francophone qui configure son assistant, pas un
// développeur tiers.
export const Route = createFileRoute("/developers")({
  component: DevelopersPage,
});

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="absolute right-2 top-2"
        onClick={() => {
          void navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Copié" : "Copier"}
      </Button>
    </div>
  );
}

function DevelopersPage() {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const apiOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://toko.app";

  const mcpConfig = JSON.stringify(
    {
      mcpServers: {
        toko: {
          command: "npx",
          args: ["-y", "@toko/mcp"],
          env: {
            TOKO_API_KEY: "toko_sk_votre_cle_ici",
            TOKO_API_URL: apiOrigin,
          },
        },
      },
    },
    null,
    2,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="mb-3 text-3xl font-semibold tracking-tight">
        Développeurs
      </h1>
      <p className="mb-10 text-muted-foreground leading-relaxed">
        Tokō permet de connecter votre propre assistant IA à vos données de
        suivi, en <strong>lecture seule</strong>. Vous générez une clé
        d'accès, vous la confiez à votre assistant, et il peut consulter les
        symptômes, le journal, les traitements ou les routines de vos enfants
        pour vous aider — sans jamais rien modifier ni supprimer.
      </p>

      {/* --- Clés d'accès --- */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-medium">
          <KeyRound className="h-5 w-5 text-primary" />
          Vos clés d'accès
        </h2>
        {isLoggedIn ? (
          <AgentKeysManager />
        ) : (
          <Callout variant="info">
            Connectez-vous à votre compte pour générer une clé d'accès.{" "}
            <Link to="/login" className="font-medium underline">
              Se connecter
            </Link>
          </Callout>
        )}
      </section>

      {/* --- Connecter un assistant (MCP) --- */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-medium">
          Connecter votre assistant IA
        </h2>
        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
          Tokō fournit un serveur <strong>MCP</strong> (Model Context
          Protocol), le standard utilisé par les assistants IA pour se
          connecter à une application. Ajoutez la configuration suivante à
          votre assistant (par exemple dans le fichier de configuration de
          Claude Desktop), en remplaçant la clé par celle générée ci-dessus :
        </p>
        <CodeBlock code={mcpConfig} />
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Le serveur expose des outils en lecture seule&nbsp;:{" "}
          <code className="text-xs">list_children</code>,{" "}
          <code className="text-xs">list_symptoms</code>,{" "}
          <code className="text-xs">list_journal_entries</code>,{" "}
          <code className="text-xs">list_medications</code>,{" "}
          <code className="text-xs">list_routines</code>,{" "}
          <code className="text-xs">get_child_stats</code>, etc.
        </p>
        <Callout variant="info" className="mt-4">
          Tant que le paquet <code className="text-xs">@toko/mcp</code> n'est
          pas publié sur npm, lancez le serveur depuis les sources du dépôt :{" "}
          <code className="text-xs">node apps/mcp/dist/index.js</code> après{" "}
          <code className="text-xs">pnpm --filter @toko/mcp build</code>.
        </Callout>
      </section>

      {/* --- API REST --- */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-medium">API REST</h2>
        <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
          Le serveur MCP s'appuie sur l'API REST de Tokō. Vous pouvez aussi
          l'appeler directement en plaçant votre clé dans l'en-tête{" "}
          <code className="text-xs">x-api-key</code>. Le contrat complet est
          décrit au format OpenAPI&nbsp;:
        </p>
        <p className="mb-4">
          <a
            href="/api/openapi.json"
            className="text-sm font-medium text-primary underline"
            target="_blank"
            rel="noreferrer"
          >
            /api/openapi.json
          </a>
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <strong>Lecture seule</strong> — toute requête de modification
              est rejetée (erreur 403).
            </span>
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <strong>Périmètre limité</strong> — seules les données de suivi
              de l'enfant sont accessibles. Le coffre de documents médicaux,
              l'export RGPD, la facturation et la gestion du compte restent
              hors de portée d'une clé.
            </span>
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <strong>Quota</strong> — 60 requêtes par minute et par clé.
            </span>
          </li>
        </ul>
      </section>

      {/* --- RGPD --- */}
      <Callout variant="warning">
        Une clé d'accès donne à un outil tiers un accès à des{" "}
        <strong>données de santé concernant des mineurs</strong>. Ne la
        partagez qu'avec un assistant de confiance, ne la publiez jamais, et
        révoquez-la dès que vous ne l'utilisez plus. Vous gardez le contrôle&nbsp;:
        une clé révoquée cesse de fonctionner immédiatement.
      </Callout>
    </div>
  );
}

function AgentKeysManager() {
  const keys = useAgentKeys(true);
  const createKey = useCreateAgentKey();
  const revokeKey = useRevokeAgentKey();

  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [created, setCreated] = useState<CreatedAgentKey | null>(null);

  const canSubmit = name.trim().length > 0 && consent && !createKey.isPending;

  function handleCreate() {
    createKey.mutate(
      { name: name.trim() },
      {
        onSuccess: (key) => {
          setCreated(key);
          setName("");
          setConsent(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof ApiError
              ? err.message
              : "Échec de la création de la clé",
          );
        },
      },
    );
  }

  function handleRevoke(id: string, label: string) {
    if (
      !window.confirm(
        `Révoquer la clé « ${label} » ? Tout assistant qui l'utilise perdra l'accès.`,
      )
    ) {
      return;
    }
    revokeKey.mutate(id, {
      onSuccess: () => toast.success("Clé révoquée"),
      onError: () => toast.error("Échec de la révocation"),
    });
  }

  const activeKeys = keys.data ?? [];

  return (
    <div className="space-y-6">
      {/* Secret affiché une seule fois après création */}
      {created && (
        <Callout variant="success">
          <p className="mb-2 font-medium">
            Clé « {created.name} » créée. Copiez-la maintenant — elle ne sera
            plus jamais affichée.
          </p>
          <CodeBlock code={created.secret} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setCreated(null)}
          >
            J'ai copié la clé
          </Button>
        </Callout>
      )}

      {/* Formulaire de création */}
      <Card>
        <CardHeader>
          <CardTitle>Créer une clé d'accès</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="agent-key-name">Nom de la clé</Label>
            <Input
              id="agent-key-name"
              value={name}
              maxLength={60}
              placeholder="Mon assistant Claude"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="agent-consent"
              checked={consent}
              onCheckedChange={(value) => setConsent(value === true)}
            />
            <Label
              htmlFor="agent-consent"
              className="text-sm font-normal leading-relaxed text-muted-foreground"
            >
              Je comprends que cette clé donnera à mon assistant IA un accès en
              lecture seule aux données de suivi de mes enfants — des données
              de santé concernant des mineurs — et que je peux la révoquer à
              tout moment.
            </Label>
          </div>
          <Button type="button" disabled={!canSubmit} onClick={handleCreate}>
            <Plus />
            Créer la clé
          </Button>
        </CardContent>
      </Card>

      {/* Liste des clés */}
      {keys.isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : activeKeys.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune clé pour l'instant.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {activeKeys.map((key) => (
            <li
              key={key.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{key.name}</p>
                <p className="text-xs text-muted-foreground">
                  <code>{key.prefix}…</code> · créée le{" "}
                  {formatDate(key.createdAt)} · dernière utilisation&nbsp;:{" "}
                  {formatDate(key.lastUsedAt)}
                  {key.revokedAt && " · révoquée"}
                </p>
              </div>
              {key.revokedAt ? (
                <span className="shrink-0 text-xs text-muted-foreground">
                  Révoquée
                </span>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={revokeKey.isPending}
                  onClick={() => handleRevoke(key.id, key.name)}
                >
                  <Trash2 />
                  Révoquer
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
