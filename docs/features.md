# Fonctionnalités

Inventaire des fonctionnalités utilisateur de Tokō, avec leurs routes et API associées.

> Les routes applicatives listées ici sont sous `/_authenticated` : elles exigent une
> session. Les pages publiques (`/`, `/tarifs`, `/formation`, `/ressources/*`) sont
> décrites dans [product-strategy.md](./product-strategy.md).

## Suivi — `/suivi`

Page d'accueil du groupe « Suivi » : un point d'entrée unique vers tous les écrans de
saisie quotidienne, pour garder la barre latérale courte sans enterrer les
fonctionnalités dans un menu secondaire.

## Tableau de bord — `/dashboard`

Vue synthétique affichant :

- **Série** — Nombre de jours consécutifs avec au moins un relevé de symptômes
- **Humeur récente** — Dernière humeur enregistrée dans le journal (1 à 4)
- **Graphique des symptômes** — Courbes mood / focus / agitation sur semaine, mois ou trimestre
- **Journal d'humeur rapide** — Saisie de l'humeur du jour en un clic (crée une entrée de journal)

Source : `GET /api/stats/:childId?period=week|month|quarter`

## Suivi des symptômes — `/symptoms`

Relevés quotidiens notés sur 7 dimensions (0-10) :

- Agitation
- Concentration
- Impulsivité
- Régulation émotionnelle
- Sommeil
- Comportement social
- Autonomie

Champs libres optionnels : contexte (ex. « journée d'école ») et notes.

API : `GET/POST/PATCH/DELETE /api/symptoms`

## Journal d'observations — `/journal`

Notes libres quotidiennes avec :

- Humeur (1 à 4) et émojis
- Étiquettes thématiques : école, victoire, crise, médicament, sommeil, sport, thérapie
- Texte libre (max 5000 caractères)

API : `GET/POST/PATCH/DELETE /api/journal`

## Routines — `/routines`

Séquences d'étapes courtes qui rendent la journée plus prévisible (matin, coucher,
devoirs). Fractionner une tâche en étapes ordonnées est le motif central du programme
Barkley. Une routine peut être créée de zéro ou instanciée depuis un modèle, et chaque
complétion est historisée pour alimenter les analyses.

API : `GET /api/routines/:childId`, `GET /api/routines/:childId/completions`,
`POST /api/routines`, `POST /api/routines/from-template`,
`PATCH /api/routines/:id`, `PATCH /api/routines/:id/steps`,
`POST /api/routines/:id/complete`, `POST /api/routines/:id/uncomplete`,
`DELETE /api/routines/:id`

## Minuteur visuel — `/timer`

Un cadran qui se vide pour rendre le temps restant perceptible — devoirs, brossage de
dents, jeu vidéo, transition. Le décompte est entièrement côté client : il n'a pas
d'API propre. Terminer une session peut faire découvrir un compagnon (voir ci-dessous).

## Compagnons

Collection d'animaux débloqués en terminant des sessions de minuteur. La collection est
rattachée à l'enfant (`childId`), pas au compte : deux enfants d'une même famille
gardent des collections distinctes. L'index unique `(childId, animalId)` rend
l'enregistrement idempotent — recroiser un animal déjà rencontré n'est jamais un doublon.

API : `GET /api/companions/:childId`, `POST /api/companions`

## Traitements — `/medications`

Suivi des médicaments et de l'observance : posologies déclarées par le parent et
journal de prises, avec un taux d'observance calculé.

Tokō ne recommande aucun traitement et n'ajuste aucune posologie — c'est un registre
déclaratif, cf. [business-rules.md](./business-rules.md).

API : `GET /api/medications/:childId`, `GET /api/medications/:childId/adherence`,
`POST /api/medications`, `POST /api/medications/logs`,
`PATCH /api/medications/:id`, `DELETE /api/medications/:id`

## Liste de crise — `/crisis-list`

Liste d'activités apaisantes construites avec l'enfant :

- 20 suggestions prédéfinies (câlin, respiration, musique, dessin…)
- Emoji personnalisable par activité
- Réordonnement par glisser-déposer
- **Mode crise plein écran** : navigation par swipe (mobile) ou flèches/clavier (desktop), dots de progression cliquables, raccourcis Escape pour fermer

API : `GET/POST/PATCH/DELETE /api/crisis-list`, `POST /api/crisis-list/:childId/reorder`

## Programme Barkley — `/barkley`

Programme PEHP d'entraînement parental en 10 étapes. Chaque étape complétée nécessite de valider un quiz de compréhension. Voir [barkley-program.md](./barkley-program.md).

API : `GET/POST/DELETE /api/barkley/steps`

## Tableau de récompenses — `/rewards`

Gamification de la motivation avec :

- **Comportements hebdomadaires** : grille 7 jours avec checkboxes quotidiennes, drag-and-drop
- **Cumul d'étoiles** : chaque comportement validé = 1 étoile
- **Récompenses** : chaque récompense a un coût en étoiles à débloquer
- Réclamation atomique (prévention des doubles claims via transaction SQL)

API : `GET/POST/PATCH/DELETE /api/barkley/behaviors`, `/api/barkley/rewards`, `/api/barkley/logs`, `/api/barkley/stars/:childId`, `POST /api/barkley/rewards/:id/claim`

## Analyses — `/insights`

Tendances sur 30 et 90 jours et motifs qui se dégagent avec du recul : corrélations
entre dimensions et minutes d'apaisement cumulées.

La page reste accessible sans abonnement : les comptes sans abonnement actif y voient
un encart de proposition de valeur, dont la forme est pilotée par le drapeau
`paywall_variant`.

API : `GET /api/stats/:childId/correlations`, `GET /api/stats/:childId/calm-minutes`

## Rapport — `/report`

Synthèse destinée à la consultation, exportable en PDF ou envoyée par email.
Fonctionnalité de l'offre Famille (la page présente un encart d'upsell aux comptes
sur l'offre gratuite).

API : `POST /api/report/pdf`, `POST /api/report/send-email`

## Humeur du parent

Relevé de l'état du parent lui-même, distinct de celui de l'enfant.

API : `GET/POST /api/parent-mood`

## Partage d'un enfant

Un second adulte (co-parent, proche) peut être invité à accéder au suivi d'un enfant.
L'invitation se consomme par jeton ; les accès accordés sont révocables au niveau de
la famille comme de l'enfant.

API : `GET /api/child-invitations`, `GET /api/child-invitations/:token`,
`DELETE /api/child-invitations/:id`, `GET /api/child-access/family`,
`GET /api/child-access/child/:childId`,
`DELETE /api/child-access/family/user/:userId`,
`DELETE /api/child-access/child/:childId/user/:userId`

## Base de connaissances — `/connaissances`

Articles éducatifs sur le TDAH consultables dans l'application (`/connaissances/$slug`) :
dysrégulation émotionnelle, co-régulation parent-enfant, fonctions exécutives,
hypersensibilité sensorielle, troubles du sommeil, etc. Les sources vivent dans
`docs/knowledge-base/`. Une sélection est également publiée en accès libre sous
`/ressources/*` pour le référencement.

## Tarif solidaire

Un parent en difficulté budgétaire (parent isolé, chômage) peut demander l'offre
Famille à tarif adapté, sans justificatif. La demande passe en revue manuelle
(`pending` / `approved` / `rejected`) et la réponse est annoncée sous 48 heures. Le
champ `admin_note` reste interne et n'est jamais exposé au parent.

API : `GET /api/solidarity/mine`, `POST /api/solidarity`

## Notifications push

Notifications Web Push (VAPID), désactivées tant que les clés ne sont pas configurées.

API : `GET/POST /api/push/*`

## Mon compte — `/account`

- Informations personnelles
- Gestion de l'abonnement Stripe (checkout, portail client, essai 14 jours)
- Second facteur (`/2fa`) et connexion par passkey
- **RGPD** : export JSON des données personnelles (art. 20) et suppression de compte (art. 17)

API : `GET/POST /api/billing/*`, `DELETE /api/account`, `GET /api/account/export`

## Administration

Réservé aux comptes administrateurs : analyses internes (`/admin-analytics`),
utilisateurs (`/admin-users`), paramètres (`/admin-settings`), plus les drapeaux de
fonctionnalités et le journal d'audit.

API : `/api/admin/analytics`, `/api/admin/users`, `/api/admin/settings`,
`/api/feature-flags`, `/api/audit-log`

## Intégrations

- **Clés d'agent** (`/developers`) — jetons pour l'accès programmatique, cf. `/api/agent-keys`
- **Roadmap publique** et **retours bêta** — `/api/roadmap`, `/api/beta-feedback`
- **Actualités produit** — `/api/news`

## Accessibilité et mobile

- **PWA** installable (manifeste, icônes, thème couleur)
- Safe-area insets pour téléphones à encoche
- Tailles de touche ≥ 40px sur mobile
- Navigation clavier + lecteurs d'écran (ARIA)
- Swipe mobile natif en mode crise

Un compagnon Android (Expo, `apps/mobile`) existe dans le dépôt ; sa fiche Play Store
est rédigée mais **non soumise** — cf. [phase4-store-listing.md](./phase4-store-listing.md).
