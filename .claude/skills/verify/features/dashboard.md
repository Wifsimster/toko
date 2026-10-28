# Accueil

`/dashboard` : salutation, « Et vous, comment ça va ? » (humeur du parent), la carte « une seule chose » avec Mō, puis l'article du jour, le suivi rapide et les tendances. Le bouton SOS flottant reste visible.

## Sub-features

- `parent-mood`: cinq boutons (échelle 1 à 5, libellés « Épuisé·e » à « Très bien ») illustrés par Mō (fatigue, trop-plein, inquiétude, calme, fierté ; table partagée avec l'onboarding, `components/mo/parent-mood-faces.ts`). `POST /api/parent-mood`, barre des 7 derniers jours.
- `one-thing`: le premier geste du jour pas encore fait pour l'enfant actif (relevé, journal, traitement) sur le pastel menthe, avec Mō en accueil et un bouton « Commencer ». Les autres gestes sont listés sous « Plus tard, si vous avez le temps ». Tout fait : Mō en fierté sur le pastel miel.
- `sos-breathing`: le bouton SOS flottant ouvre le mode crise ; « Respiration guidée » mène à « Respirez avec moi » : cercle 4-4-4-4 (cycle 16 s), Mō en calme au centre qui gonfle et se dégonfle avec le cercle tant que l'écran est ouvert, consigne « Inspirez / Retenez / Expirez / Pause » sous le cercle (`aria-live`). Sous `prefers-reduced-motion`, Mō et le cercle sont immobiles, la consigne change toujours.
- `empty-state`: sans enfant, Mō en accueil au-dessus de « Bienvenue sur Tokō » et du bouton « Ajouter un enfant ». Mō salue de la main une fois à l'apparition (rien sous `prefers-reduced-motion`) ; un clic sur Mō rejoue le salut.

## How to get to it (user POV)

- « Aujourd'hui » dans la sidebar ou « Accueil » dans la barre d'onglets mobile.

## Driving it with control-toko

Preconditions:

- `$C login` a réussi.

- **Une seule chose.** La carte n'est en fierté que si l'enfant a un relevé **et** une entrée de journal aujourd'hui. Lucas a les deux dans la graine ; Emma n'a que le relevé, sa carte affiche « Écrire un mot sur la journée de Emma ». Les dates de la graine sont relatives au jour du `launch` : après minuit, aucun enfant n'est à jour. `$C child add --name "Pilote Fictif"` puis `$C goto /dashboard` : la carte affiche « Noter la journée de Pilote Fictif ». `$C click --role link --name "Commencer"` ouvre `/symptoms`.
- **Humeur du parent.** `$C click --role button --name "^Bien$"` (sans les ancres, le nom attrape aussi « Très bien »), puis `$C db "select score from parent_mood_logs order by updated_at desc limit 1"` (4).
- **Captures.** `$C screenshot --mobile` pour 390 px.
- **Respirez avec moi.** `$C click --role button --name "Ouvrir le mode SOS Crise"`, puis `$C click --role button --name "Respiration guidée"`. `control-toko` n'émule pas `prefers-reduced-motion` : pour le vérifier, se connecter au CDP du navigateur (`127.0.0.1:38622` en slot 0, plus `slot × 100` sinon) avec Playwright et appeler `page.emulateMedia({ reducedMotion: "reduce" })`.

## Gotchas

- Mō n'apparaît jamais en mode crise (sauf « Respirez avec moi »), sur le rapport PDF ni à côté d'un paywall (DESIGN.md, « Mō »).
- La feuille du widget Koe est rangée dans la couche `base` (`components/koe-widget.css`) : avant, elle neutralisait tous les `ring-*` de l'espace connecté.
