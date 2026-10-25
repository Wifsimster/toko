# Accueil

`/dashboard` : salutation, « Et vous, comment ça va ? » (humeur du parent), la carte « une seule chose » avec Mō, puis l'article du jour, le suivi rapide et les tendances. Le bouton SOS flottant reste visible.

## Sub-features

- `parent-mood`: cinq boutons (échelle 1 à 5, libellés « Épuisé·e » à « Très bien ») illustrés par Mō (fatigue, trop-plein, inquiétude, calme, fierté ; table partagée avec l'onboarding, `components/mo/parent-mood-faces.ts`). `POST /api/parent-mood`, barre des 7 derniers jours.
- `one-thing`: le premier geste du jour pas encore fait pour l'enfant actif (relevé, journal, traitement) sur le pastel menthe, avec Mō en accueil et un bouton « Commencer ». Les autres gestes sont listés sous « Plus tard, si vous avez le temps ». Tout fait : Mō en fierté sur le pastel miel.
- `empty-state`: sans enfant, Mō en accueil au-dessus de « Bienvenue sur Tokō » et du bouton « Ajouter un enfant ».

## How to get to it (user POV)

- « Aujourd'hui » dans la sidebar ou « Accueil » dans la barre d'onglets mobile.

## Driving it with control-toko

Preconditions:

- `$C login` a réussi.

- **Une seule chose.** Les enfants semés ont un relevé du jour : la carte est en fierté. `$C child add --name "Pilote Fictif"` puis `$C goto /dashboard` : la carte affiche « Noter la journée de Pilote Fictif ». `$C click --role link --name "Commencer"` ouvre `/symptoms`.
- **Humeur du parent.** `$C click --role button --name "Bien"`, puis `$C db "select score from parent_mood_logs order by updated_at desc limit 1"` (4).
- **Captures.** `$C screenshot --mobile` pour 390 px.

## Gotchas

- Mō n'apparaît jamais en mode crise, sur le rapport PDF ni à côté d'un paywall (DESIGN.md, « Mō »).
- La feuille du widget Koe est rangée dans la couche `base` (`components/koe-widget.css`) : avant, elle neutralisait tous les `ring-*` de l'espace connecté.
