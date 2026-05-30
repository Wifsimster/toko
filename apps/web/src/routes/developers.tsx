import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Callout } from "@/components/ui/callout";
import { useSeoHead } from "@/hooks/use-seo-head";
import { CodeBlock } from "./developers-code-block";
import { AgentKeysManager } from "./developers-agent-keys";

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


function DevelopersPage() {
  useSeoHead({
    title: "Développeurs — connecter un assistant IA | Tokō",
    description:
      "Connectez votre assistant IA à vos données Tokō en lecture seule via le serveur MCP ou la ligne de commande. Générez une clé d'accès, gardez le contrôle.",
    canonical: "https://toko.battistella.ovh/developers",
  });
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

  const cliExample = [
    "export TOKO_API_KEY=toko_sk_votre_cle_ici",
    `export TOKO_API_URL=${apiOrigin}`,
    "",
    "npx -y @toko/cli children",
    "npx -y @toko/cli stats <id-enfant>",
  ].join("\n");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
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
        pour vous aider, sans jamais rien modifier ni supprimer.
      </p>

      {/* --- Clés d'accès --- */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-medium">
          <KeyRound className="size-5 text-primary" />
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

      {/* --- Ligne de commande (CLI) --- */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-medium">Ligne de commande</h2>
        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
          Si votre agent dispose d'un terminal (Claude Code, un script, une
          intégration continue…), l'outil <code className="text-xs">toko</code>{" "}
          est plus direct qu'un serveur MCP. Il utilise la même clé d'accès et
          la même surface en lecture seule.
        </p>
        <CodeBlock code={cliExample} />
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Lancez <code className="text-xs">toko help</code> pour la liste
          complète des commandes (<code className="text-xs">children</code>,{" "}
          <code className="text-xs">symptoms</code>,{" "}
          <code className="text-xs">journal</code>,{" "}
          <code className="text-xs">stats</code>…). Chaque commande renvoie du
          JSON sur la sortie standard.
        </p>
        <Callout variant="info" className="mt-4">
          Tant que le paquet <code className="text-xs">@toko/cli</code> n'est
          pas publié sur npm, lancez l'outil depuis les sources du dépôt :{" "}
          <code className="text-xs">node apps/cli/dist/index.js</code> après{" "}
          <code className="text-xs">pnpm --filter @toko/cli build</code>.
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
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <strong>Lecture seule</strong>, toute requête de modification
              est rejetée (erreur 403).
            </span>
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <strong>Périmètre limité</strong>, seules les données de suivi
              de l'enfant sont accessibles. Le coffre de documents médicaux,
              l'export RGPD, la facturation et la gestion du compte restent
              hors de portée d'une clé.
            </span>
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <strong>Quota</strong>, 60 requêtes par minute et par clé.
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

