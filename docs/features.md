# Fonctionnalités

Inventaire des fonctionnalités utilisateur de Tokō, avec leurs routes et API associées.

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

## Mon compte — `/account`

- Informations personnelles
- Gestion de l'abonnement Stripe (checkout, portail client, essai 14 jours)
- **RGPD** : export JSON des données personnelles (art. 20) et suppression de compte (art. 17)

API : `GET/POST /api/billing/*`, `DELETE /api/account`, `GET /api/account/export`

## Base de connaissances

Articles éducatifs sur le TDAH dans `docs/knowledge-base/` : dysrégulation émotionnelle, co-régulation parent-enfant, fonctions exécutives, hypersensibilité sensorielle, troubles du sommeil, etc. (non encore exposés dans l'UI).

## Accessibilité et mobile

- **PWA** installable (manifeste, icônes, thème couleur)
- Safe-area insets pour téléphones à encoche
- Tailles de touche ≥ 40px sur mobile
- Navigation clavier + lecteurs d'écran (ARIA)
- Swipe mobile natif en mode crise
