# Intégration Stripe

Gestion des abonnements et paiements dans Tokō via **Stripe**. Ce document décrit le modèle tarifaire, le flux de paiement et la gestion des webhooks.

## Modèle tarifaire

Tokō propose deux plans :

| Plan | Prix | Inclus |
|------|------|--------|
| **Gratuit** | 0 € | 1 profil enfant |
| **Famille** | 4,99 €/mois | 3 profils enfants |

## Flux de paiement

```mermaid
sequenceDiagram
    participant P as Parent
    participant W as Frontend
    participant A as API Tokō
    participant S as Stripe

    P->>W: Clique sur "S'abonner"
    W->>A: POST /api/billing/checkout
    A->>S: Création session Checkout
    S-->>A: URL de paiement
    A-->>W: Redirection vers Stripe
    W->>S: Paiement sécurisé
    S->>A: Webhook checkout.session.completed
    A->>A: Création abonnement en base
    P->>W: Retour sur l'application
```

Le parent est redirigé vers la page de paiement hébergée par Stripe. Après paiement, Stripe notifie Tokō via webhook.

## Endpoints API

| Route | Méthode | Rôle |
|-------|---------|------|
| `/api/billing/checkout` | POST | Crée une session Stripe Checkout |
| `/api/billing/status` | GET | Vérifie le statut d'abonnement |
| `/api/billing/stripe/webhook` | POST | Reçoit les événements Stripe |

## Webhooks Stripe

Trois événements sont traités :

- **`checkout.session.completed`** — Paiement réussi, création de l'abonnement en base
- **`customer.subscription.updated`** — Changement de plan ou renouvellement
- **`customer.subscription.deleted`** — Annulation de l'abonnement

> **Détail technique** — Le webhook est monté avant le middleware CORS dans la chaîne Hono. Stripe requiert le body brut (non parsé) pour valider la signature.

## Variables d'environnement

| Variable | Côté | Description |
|----------|------|-------------|
| `STRIPE_SECRET_KEY` | Backend | Clé secrète API Stripe |
| `STRIPE_WEBHOOK_SECRET` | Backend | Secret de validation des webhooks |
| `STRIPE_PRICE_ID` | Backend | Identifiant du plan tarifaire |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend | Clé publique Stripe |

## Table `subscription`

L'abonnement est stocké en base et lié à l'utilisateur :

- `stripeCustomerId` — Identifiant client Stripe
- `stripeSubscriptionId` — Identifiant unique de l'abonnement
- `status` — Statut actuel (`active`, `canceled`, etc.)
- `currentPeriodEnd` — Date de fin de la période en cours

## Suppression de compte

Lors de la suppression d'un compte (RGPD), si l'utilisateur a un abonnement Stripe actif, celui-ci est automatiquement annulé avant la suppression des données.
