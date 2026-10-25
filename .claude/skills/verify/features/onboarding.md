# Onboarding Mō

Le premier passage d'un parent connecté ouvre un parcours plein écran (direction « Mō ») : splash, promesse, « Comment ça va, aujourd'hui ? », « Qu'est-ce qui vous aiderait le plus ? », « Voici Mō », « Ce qui est gratuit, ce qui est payant », « C'est parti ». Pagination sur 6 (le splash n'en fait pas partie). Il remplace l'ancienne visite guidée (`OnboardingTour`). Aucun paywall ; le catalogue Gratuit / Famille est un écran obligatoire en lecture seule (freemium-ethics-policy §4).

## Sub-features

- `onboarding-open`: `OnboardingGate` (dans `AuthenticatedLayout`) charge le parcours à la demande quand `toko-ui.onboardingCompleted` est faux. Le menu utilisateur « Revoir la présentation » le rouvre.
- `onboarding-mood`: six cartes radio. Le dernier choix est envoyé une seule fois à `POST /api/parent-mood`, à la sortie du parcours (table partagée `components/mo/parent-mood-faces.ts` : fatigue 1, trop-plein 2, inquiétude 3, calme 4, fierté 5). « Je préfère ne pas dire », même choisi après coup, n'envoie rien.
- `onboarding-goal`: cinq lignes radio. Le choix reste dans `localStorage` (`toko-ui.onboardingGoal`), sans API ni migration.
- `onboarding-finish`: sans enfant, « Ajouter mon enfant » ferme le parcours et ouvre le formulaire d'ajout de l'accueil ; avec un enfant, « Voir mon accueil ». « Passer » et Échap mènent au catalogue depuis tout écran qui le précède (jamais par-dessus) ; sur le catalogue, Échap et « Suivant » mènent à la fin ; « Plus tard » ferme. Les réponses données sont gardées.
- `onboarding-plans`: écran 5 sur 6, « Ce qui est gratuit, ce qui est payant » : Gratuit, Famille, prix, essai sans carte. Lecture seule : pas de « Passer », aucun bouton de paiement, pas de Mō.
- `onboarding-inert`: tant que le parcours est ouvert, `#root` est `inert` (le portail est rendu hors de `#root`) : Tab n'atteint jamais la page cachée.
- `onboarding-a11y`: titre de chaque écran en `h1` qui prend le focus, pagination en liste « Progression » avec `aria-current="step"`, boutons « Retour » et « Suivant » nommés, Mō décoratif (`aria-hidden`).

## How to get to it (user POV)

- Première connexion sur un navigateur (le stockage local ne contient pas encore `onboardingCompleted`).
- Menu utilisateur (bas de la sidebar, ou « Plus » sur mobile) > « Revoir la présentation ».

## Driving it with control-toko

Preconditions:

- `$C login` a réussi. `login` marque l'onboarding comme vu (comme `e2e/auth.setup.ts`) : rouvrez-le par le menu.

- **Ouvrir.** `$C click --role button --name "Menu utilisateur"`, puis `$C click --role menuitem --name "Revoir la présentation"`. `$C snapshot --selector "[data-testid=onboarding]"` montre le titre `Tokō` et « Commencer ».
- **Avancer.** `$C click --role button --name "Commencer"`, puis `--name "Suivant"`. Les cartes d'humeur et d'objectif sont des `label` qui portent un radio masqué : cliquez par texte (`$C click --text "Fatigué·e"`).
- **Seconde lecture.** Après l'écran humeur : `$C db "select date, score from parent_mood_logs order by updated_at desc limit 1"` (score 1 pour « Fatigué·e ») et `$C network-log --filter /api/parent-mood` (POST 201).
- **Nouveau parent sans enfant.** Inscription par l'onglet « Inscription » de `/login` avec une adresse fictive (`…@example.test`) : le parcours s'ouvre seul et « Ajouter mon enfant » ouvre « Ajouter votre enfant ».

## Gotchas

- Le parcours vit dans un portail Base UI (`[data-testid=onboarding]`) : le reste de la page est inerte tant qu'il est ouvert, et `getByRole` ne voit plus le `h1#page-title` de l'accueil.
- Les dessins de Mō (`assets/mo/`) sont hors précache du service worker : ils sont mis en cache au premier affichage. Le module du parcours est précaché ; s'il manque quand même (hors ligne, déploiement), la porte rend `null` et le parcours s'ouvrira à la visite suivante.
- En sombre, Mō sombre (liseré crème) est chargé seul d'après la classe `.dark` ; le décor des scènes passe sur `SCENE_DARK_FILLS`. Émulez `prefers-color-scheme: dark` (thème « système ») pour le vérifier.
