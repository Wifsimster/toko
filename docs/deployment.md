# Déploiement

Guide de déploiement de Tokō en production. L'application est conteneurisée avec Docker et déployée automatiquement via GitHub Actions.

## Architecture de production

```mermaid
graph LR
    A[Internet] -->|HTTPS| B[Traefik]
    B -->|Port 8080| C[Conteneur Tokō]
    C --> D[Conteneur PostgreSQL]
    D --> E[Volume persistent]
```

Traefik gère le routage HTTPS avec certificat Let's Encrypt. Le conteneur Tokō sert l'API et le frontend. PostgreSQL stocke les données sur un volume persistant.

## Conteneur Docker

Le Dockerfile utilise un build multi-étapes :

1. **deps** — Installation des dépendances pnpm
2. **frontend-builder** — Build du frontend React (Vite)
3. **runner** — Image de production Node.js 22 Alpine

Le conteneur final inclut :
- Le code source backend (transpilé au runtime par tsx)
- Le frontend buildé (fichiers statiques)
- Les migrations Drizzle

> **Détail technique** — Le conteneur tourne avec un utilisateur non-root (`toko`, UID 1001). Les capabilities Linux sont restreintes (`cap_drop: ALL`).

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `BETTER_AUTH_SECRET` | Clé de chiffrement des sessions | Générer avec `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL publique de l'application | `https://toko.battistella.ovh` |
| `CORS_ORIGIN` | Origine autorisée pour le CORS | `https://toko.battistella.ovh` |
| `GOOGLE_CLIENT_ID` | OAuth Google (optionnel) | — |
| `GOOGLE_CLIENT_SECRET` | OAuth Google (optionnel) | — |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | `whsec_...` |
| `RESEND_API_KEY` | Clé API Resend pour les emails (optionnel) | — |
| `EMAIL_FROM` | Expéditeur des emails — domaine vérifié Resend | `Tokō <no-reply@toko.app>` |
| `APP_URL` | URL publique utilisée dans les liens email | `https://toko.battistella.ovh` |
| `CRON_SECRET` | Secret pour déclencher les jobs (rappels, bilan) | `openssl rand -hex 32` |

## Jobs planifiés (emails)

Deux endpoints déclenchent l'envoi des emails (désactivés tant que `CRON_SECRET` n'est pas défini → renvoient 501) :

- `POST /api/jobs/daily-reminders` — rappel quotidien à 9h locale si aucun relevé
- `POST /api/jobs/weekly-digest` — bilan hebdomadaire le dimanche à 18h locale

Les jobs sont idempotents (garde-fou 20h / 6 jours) et auto-filtrent sur l'heure locale de chaque utilisateur, donc un scheduler externe peut les appeler toutes les 15-60 minutes.

Exemple avec GitHub Actions (`.github/workflows/cron.yml`) :

```yaml
on:
  schedule:
    - cron: "*/30 * * * *"
jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -sS -X POST https://toko.battistella.ovh/api/jobs/daily-reminders \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}"
          curl -sS -X POST https://toko.battistella.ovh/api/jobs/weekly-digest \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}"
```

## Pipeline de déploiement

```mermaid
graph LR
    A[Push sur main] --> B[Détection version]
    B --> C[Tests + Typage]
    C --> D[Bump version]
    D --> E[Build Docker]
    E --> F[Push GHCR]
    F --> G[Deploy serveur]
```

Le déploiement est entièrement automatique après un merge sur `main` :

1. **Détection** — Le type de release est déduit du message de commit conventionnel
2. **Vérifications** — Typage, tests unitaires, scan de fuites de secrets
3. **Versionnage** — Bump de version dans tous les `package.json`
4. **Build** — Construction de l'image Docker multi-plateforme
5. **Publication** — Push vers `ghcr.io/wifsimster/toko` (tags : latest, version complète, mineure)
6. **Déploiement** — Exécution du script `deploy/deploy.sh` sur le serveur

## Déploiement manuel

Pour déployer manuellement depuis le poste de développement :

```bash
pnpm release    # Build + Docker build + tag + push
```

Pour relancer le déploiement sur le serveur :

```bash
# Sur le serveur de production
cd /opt/toko
docker compose pull toko
docker compose up -d toko
docker image prune -f
```

## Démarrage local avec Docker

Pour tester l'image Docker en local :

```bash
# Démarrer PostgreSQL
docker compose -f compose.local.yml up -d

# Construire l'image
pnpm docker:build

# Lancer le conteneur
docker run --rm -p 8080:8080 --env-file .env ghcr.io/wifsimster/toko:latest
```

## Health check

L'API expose un endpoint de santé : `GET /api/health`. Le conteneur Docker vérifie ce endpoint toutes les 30 secondes. Si trois vérifications échouent consécutivement, le conteneur est considéré comme défaillant.
