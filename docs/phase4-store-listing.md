# Fiche Play Store — Tokō (compagnon Android)

> Textes prêts à coller dans la Play Console. Optimisés pour les requêtes du
> §Phase 4 de la stratégie : « routine enfant TDAH », « rappel routine matin
> enfant ». À relire/adapter par l'éditeur avant soumission ; ne rien promettre
> de médical (positionnement « accompagnement », pas « soin »).

- **Nom de l'app** : `Tokō — routines & rappels TDAH`
- **Package** : `app.toko.mobile`
- **Catégorie** : Parentalité
- **Prix** : Gratuit · aucun achat intégré (l'abonnement Famille se gère sur le web)

## Description courte (≤ 80 caractères)

> Routines du matin et du soir, rappels à l'heure et timer pour enfants TDAH.

## Description complète (≤ 4000 caractères)

Tokō aide les parents d'enfants concernés par le TDAH à tenir les **routines du
quotidien** sans y penser — et à ne plus jamais oublier le **rappel du soir**.

Le compagnon Android fait **trois choses, simplement** :

🌅 **Routine du matin** — les étapes du matin, cochées une par une par l'enfant,
avec un retour immédiat qui l'encourage.

🌙 **Routine du soir** — le rituel du coucher, et le rappel qui arrive **à
l'heure exacte** même téléphone verrouillé ou hors-ligne (la notification est
planifiée par le système Android, pas par un navigateur).

⏱️ **Timer-animal** — un minuteur visuel avec des compagnons à découvrir, pour
les transitions difficiles (« on range dans 5 minutes »).

Pourquoi une app native ? Parce qu'un rappel **fiable à heure fixe** est au cœur
du produit, et que le web ne garantit pas la planification en arrière-plan.
Android, lui, la garantit.

**Pensé pour le TDAH — et pour des parents souvent concernés eux aussi :**
un seul écran à la fois, des libellés clairs, aucune surcharge. On retire plutôt
que d'ajouter.

**Gratuit, sans pub, sans achat intégré.** Vos données restent les vôtres,
hébergées en Europe (RGPD). Le suivi complet, l'historique et le rapport pour
les rendez-vous médicaux se retrouvent sur la version web de Tokō.

Tokō n'est pas un dispositif médical et ne remplace pas l'avis d'un
professionnel de santé.

## Mots-clés / ASO (à répartir dans le texte, pas de champ dédié sur Play)

routine enfant TDAH · rappel routine matin enfant · routine du soir · timer
enfant · minuteur visuel · TDAH enfant · habiletés parentales · rappel coucher

## Éléments graphiques à fournir (hors dépôt)

- Icône 512×512 (dispo : `apps/mobile/assets/icon.png`)
- Bandeau 1024×500
- 2–8 captures téléphone (Matin / Soir / Timer)
- Lien politique de confidentialité : la page `/confidentialite` du site web
- Coordonnées éditeur (à compléter, cf. `docs/legal-review-checklist.md`)

## Conformité Play à vérifier

- **Public visé / Données** : app destinée aux parents (pas aux enfants
  directement) — remplir le questionnaire « Sécurité des données » et la section
  « Public cible » en conséquence.
- Permissions sensibles déclarées (`SCHEDULE_EXACT_ALARM`, `POST_NOTIFICATIONS`,
  `RECEIVE_BOOT_COMPLETED`) : justifier l'usage (rappels planifiés) dans le
  formulaire.
