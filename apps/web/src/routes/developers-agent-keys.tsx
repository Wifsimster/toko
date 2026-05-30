import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { CodeBlock } from "./developers-code-block";

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AgentKeysManager() {
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
            Clé « {created.name} » créée. Copiez-la maintenant, elle ne sera
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
              lecture seule aux données de suivi de mes enfants, des données
              de santé concernant des mineurs, et que je peux la révoquer à
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
