# Plan de bêta fermée — Phase 3

> Source : `docs/product-strategy.md` §6 Phase 3. La validation ne vient pas de
> l'analytics mais d'une **bêta recrutée à la main** de 10–20 familles, avec un
> point hebdomadaire court. Ce document est le runbook opérationnel ; les
> outils logiciels (cohorte, mesures, feedback) sont dans l'app.

## 0. Prérequis logiciels (livrés)

- **Cohorte bêta** : marqueur `user.beta_cohort` posé par un admin depuis la
  console (`/admin-users` → fiche utilisateur → « Bêta fermée » → Ajouter). Il
  sert à cadrer la mesure et le feedback in-app sur les vraies familles bêta.
- **Mesures bêta** : section « Bêta » du tableau de bord admin
  (`/admin-analytics`) — voir §3.
- **Feedback in-app** : encart discret proposé aux membres de la cohorte pour
  remonter un retour qualitatif ; consultable côté admin.

## 1. Recrutement (manuel)

Cible : **10–20 familles** d'enfants concernés par le TDAH.

Canaux :
- Groupes Facebook de parents TDAH.
- Associations (ex. HyperSupers – TDAH France).
- Entourage / bouche-à-oreille.

Script d'invitation (à adapter) :

> Bonjour ! Je développe **Tokō**, une app qui aide les parents à préparer les
> rendez-vous médicaux de leur enfant TDAH (suivi + rapport pour le médecin) et
> à tenir les routines du quotidien. Je cherche **10 à 20 familles** pour un
> test privé de quelques semaines, **gratuit**, en échange de votre ressenti
> honnête (un point court par semaine). Ça vous tenterait ?

À l'inscription d'une famille bêta : créer/valider son compte, puis l'ajouter à
la cohorte depuis `/admin-users`.

## 2. Déroulé

- **Surface** : la **PWA existante** (installable — « Ajouter à l'écran
  d'accueil »). Mettre en avant comme action mobile principale : **rappels
  matin/soir** + **timer-compagnon**.
- **Durée** : viser **8 semaines** (fenêtre de rétention clé).
- **Cadence** : un **point hebdomadaire court** avec chaque famille (5–10 min :
  message ou appel). Noter les frictions, les « aha », les demandes.

## 3. Ce qu'on mesure (compteurs simples + qualitatif)

Quantitatif — section « Bêta » de `/admin-analytics` (cohorte uniquement) :
- **Opt-in notifications** : % de familles ayant activé un rappel / une
  notification push.
- **Rappel → routine cochée** : complétions de routines récentes.
- **Sessions timer / semaine** : activité du timer-compagnon (proxy :
  découvertes de compagnons).
- **Rétention à 8 semaines**.

Qualitatif — feedback in-app + notes des points hebdomadaires :
- Les rappels arrivent-ils au bon moment ? Perçus comme tardifs/manqués ?
- L'enfant réclame-t-il le timer ?
- Le rapport a-t-il servi lors d'un vrai rendez-vous ?
- Demande explicite d'une « vraie app » (signal Phase 4).

## 4. Critères de sortie → Phase 4 (compagnon Android natif)

Déclencher Phase 4 **seulement si** la bêta le confirme (cf. §Phase 4 de la
stratégie) :
- rappels web push perçus comme tardifs/manqués (surtout iOS, PWA non
  installée) ;
- enfants qui réclament le timer ;
- demande explicite d'une app native ;
- liste d'attente Android significative (`waitlist_signups`).

Tant que ces signaux ne sont pas là, **ne pas** construire le natif (« build
trap »).
