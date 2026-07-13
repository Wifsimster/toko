# Stratégie produit — Recentrage de Tokō

> Document consolidé à partir de l'issue [#335](https://github.com/Wifsimster/toko/issues/335)
> (constat, étude de marché, options stratégiques, plans marketing et technique)
> et de ses trois affinages ultérieurs : app Android compagnon, correction
> « produit en pré-lancement », et Barkley comme offre indépendante.
>
> **Cadre dominant : produit en pré-lancement, zéro utilisateur.** Toute étape
> qui supposait des données d'usage a été remplacée par une décision « par
> conviction » exécutable immédiatement (voir §5).

---

## 1. Constat — le produit a perdu son focus

L'audit du code confirme le ressenti : **Tokō expose aujourd'hui ~19 zones
fonctionnelles réparties en 5 groupes de navigation** (Connaissances, Barkley,
Décodeur, Scripts, Dashboard, Journal, Symptômes, Routines, Forces, Récompenses,
Insights, Liste de crise, Médicaments, Timer, Parcours de soins, Coffre-fort,
Burnout, Succès, Activité…), plus une app native Expo (`apps/mobile/`), un CLI,
un serveur MCP et une page développeurs. Pour un produit destiné à **des parents
TDAH** — dont le `CLAUDE.md` du projet exige lui-même « simplicité maximale, une
seule action principale par écran » — c'est une contradiction directe : le
produit impose la charge cognitive qu'il prétend réduire.

Répartition de l'investissement dans le code (lignes API + composants front) :

| Domaine | Poids | Nature |
|---|---|---|
| Rapport PDF médical (`report.ts`, 1142 loc) | **Le plus gros du produit** | Différenciant |
| Billing Stripe (829 loc) | Gros | Infrastructure |
| Co-parent / invitations (989 loc) | Gros | Différenciant |
| Barkley (610 loc) | Gros | Différenciant |
| Admin (users/analytics/settings/vault ~1170 loc) | Gros | Interne |
| Routines, Stats, Médicaments, Symptômes, Journal | Moyen | **Cœur quotidien** |
| Décodeur, Scripts, Forces, Timer/compagnons, Burnout, Succès, Activité, Parcours de soins, Coffre-fort | Petit ×9 | **Longue traîne** — c'est elle qui crée la confusion |

Le signal intéressant : **le plus gros investissement du code (le rapport PDF
pour le médecin) est aussi la fonctionnalité la plus différenciante sur le
marché** (voir §2). Le problème n'est pas ce qu'on a construit de gros, c'est la
longue traîne de petites fonctionnalités qui dilue le message.

---

## 2. Étude de marché

### Taille et dynamique
- Marché mondial des apps TDAH : **~1,9–2,2 Md$ en 2025, croissance de 15–17 %/an**,
  projeté à 6–10 Md$ d'ici 2033–2035
  ([Grand View Research](https://www.grandviewresearch.com/industry-analysis/adhd-apps-market-report),
  [The Business Research Company](https://www.thebusinessresearchcompany.com/report/attention-deficit-hyperactivity-disorder-adhd-apps-global-market-report),
  [Global Growth Insights](https://www.globalgrowthinsights.com/market-reports/adhd-apps-market-122250)).
- Le **segment enfants représente ~59 % du marché** (~1,6 Md$ en 2025)
  ([Global Growth Insights](https://www.globalgrowthinsights.com/market-reports/adhd-apps-market-122250)).
- Modèle dominant : **abonnement payant (~41 % de part en 2026)**
  ([Worldwide Market Reports](https://www.worldwidemarketreports.com/market-insights/adhd-planner-app-market-1034613)).

### Fenêtre d'opportunité française
- **~640 000 enfants et adolescents TDAH en France**, ~2 M de personnes au total
  ([handicap.gouv.fr](https://handicap.gouv.fr/une-avancee-historique-pour-le-tdah-creation-dune-filiere-de-soins-dediee-et-labellisation-de-centres-ressources-regionaux)).
- Recommandations **HAS 2024** : tout médecin formé peut désormais diagnostiquer →
  vague de nouveaux diagnostics
  ([HAS](https://www.has-sante.fr/jcms/p_3302482/fr/trouble-du-neurodeveloppement/tdah-diagnostic-et-interventions-therapeutiques-aupres-des-enfants-et-adolescents),
  [tdah-france.fr](https://www.tdah-france.fr/Nouvelles-Recos-HAS-pour-le-TDAH-Quoi-de-neuf.html)).
- **Instruction interministérielle de mai 2025** : déploiement d'une filière de
  soins TDAH régionale + labellisation de centres ressources (CRTDAH)
  ([handicap.gouv.fr](https://handicap.gouv.fr/une-avancee-historique-pour-le-tdah-creation-dune-filiere-de-soins-dediee-et-labellisation-de-centres-ressources-regionaux)).
- Le **programme Barkley est recommandé par la HAS** et délivré en ateliers
  (10 séances) avec de longues listes d'attente
  ([tdah-france.fr](https://www.tdah-france.fr/Programme-d-entrainement-aux-habiletes-parentales-de-Barkley.html)) —
  un accompagnement numérique a de la valeur, mais en complément, pas en produit
  autonome.

**Conséquence concrète :** de plus en plus de parents français vont entrer dans
un parcours de soins structuré, avec des rendez-vous médicaux réguliers
(titration de médicament, suivi) où on leur demandera « comment ça se passe à la
maison ? ». C'est exactement le problème que le suivi + rapport PDF de Tokō
résout.

### Paysage concurrentiel — deux créneaux très différents

**Créneau A : gamification des routines pour l'enfant** — *encombré*
- [Joon](https://www.joonapp.io/) (US) : 12,99 $/mois ou 89,99 $/an, mascotte
  virtuelle, leader du créneau ; mais rétention fragile — beaucoup de familles
  décrochent après 4–8 semaines
  ([Choosing Therapy](https://www.choosingtherapy.com/joon-app-review/),
  [Timily](https://timily.app/guides/joon-app-review/)).
- [Lusha (Dygie)](https://lusha.care/) (France) : jeu éducatif TDAH 6–12 ans,
  abonnement, contenus Barkley intégrés, **remboursée par la mutuelle AÉSIO**
  ([AÉSIO](https://ensemble.aesio.fr/agir-ensemble/partenaires/social-et-solidaire/dygie-lusha)) —
  concurrent français direct sur ce créneau, avec des moyens.
- [Tiimo](https://www.getinflow.io/post/best-alternatives-tiimo-adhd) : app
  iPhone de l'année 2025 d'Apple, planification visuelle, freemium.

**Créneau B : suivi médical côté parent → rapport pour le praticien** —
*peu encombré, surtout en français*
- [Theraview](https://www.theraview.app/) (EN, suivi médication),
  [Bearable](https://bearable.app/adhd-symptom-tracker/) (EN, généraliste,
  plutôt adultes), [MyTherapy](https://www.mytherapyapp.com/an-app-to-monitor-your-childs-or-your-own-adhd-treatment)
  (rappels médicaments génériques). **Aucun acteur français dédié au duo
  parent-enfant TDAH avec rapport médical structuré.**

---

## 3. Options stratégiques évaluées

| Option | Description | Potentiel | Risques / coûts |
|---|---|---|---|
| **A. Statu quo + réorganisation UI** | Garder tout, mieux ranger les menus | Faible | Ne résout pas le positionnement ; le marketing reste illisible |
| **B. Recentrage sur UN cœur (SaaS web premium)** ⭐ | « Le carnet de suivi TDAH qui prépare vos rendez-vous médicaux ». Suivi → rapport PDF. Le reste passe derrière ou disparaît | **Élevé** : créneau B peu concurrentiel, vent porteur réglementaire FR, monétisation web sans commission stores, infra existante (Stripe, PDF, co-parent) | Renoncement : couper/geler des features déjà construites |
| **C. Découpage en 2 produits** | Produit 1 = option B ; Produit 2 = app enfant gamifiée type Joon | P1 : élevé. P2 : **faible/moyen** face à Joon/Lusha/Tiimo, même problème de rétention 4–8 semaines | Double coût dev + marketing, dilution |
| **D. App native comme produit principal** | Basculer l'effort vers `apps/mobile/` (Expo) | Moyen | Commission stores 15–30 %, double maintenance, alors que la PWA existe déjà |
| **E. B2B2C (praticiens, CRTDAH, mutuelles)** | Vendre aux psychologues/centres qui prescrivent Tokō | Élevé à terme (précédent Lusha×AÉSIO) | Cycle de vente long ; prématuré sans traction B2C |

### Recommandation retenue

**Option B maintenant, E en horizon 12 mois. Pas de produit gamifié autonome,
pas d'app native comme produit principal.**

En une phrase : *sur le créneau gamification on serait le 4ᵉ entrant
sous-financé ; sur le créneau « préparer le rendez-vous médical » on est quasi
seul en français, au moment exact où l'État industrialise le parcours de soins
TDAH — et c'est déjà la partie la plus aboutie de notre code.*

**CTA unique :** « Arrivez à votre prochain rendez-vous avec un rapport clair. »

**Boucle de croissance intégrée :** chaque rapport PDF posé sur le bureau d'un
pédopsychiatre est une démo du produit auprès d'un prescripteur potentiel
(logo + URL discrets sur le rapport).

---

## 4. Architecture cible — une marque, deux surfaces, trois offres

Deux nuances majeures issues des affinages viennent préciser l'option B sans la
contredire : le rôle d'une **app Android compagnon** et le statut de la
**formation Barkley** comme offre distincte.

### 4.1 Deux surfaces, PAS deux produits

Un seul produit, un seul compte, une seule marque — mais chaque surface a **un
seul travail** :

| Surface | Job unique | Contenu | Monétisation |
|---|---|---|---|
| **App Android (compagnon)** | Exécuter la journée | 3 écrans max : routine du matin, routine du soir, timer-animal. Rien d'autre — pas de rapport, pas de réglages, **aucun parcours d'achat** | Gratuite (évite la commission Play 15–30 % et Play Billing, modèle Netflix) |
| **Web SaaS (PWA)** | Comprendre et préparer le rendez-vous | Suivi, historique, tendances, rapport PDF, co-parent, compte | Abonnement Famille 39 €/an via Stripe web |

**La boucle entre les deux est l'avantage concurrentiel :** les routines cochées
et les sessions de timer alimentent les données du rapport médical. Le parent a
une raison *médicale* de continuer l'usage quotidien — exactement ce qui manque
à Joon, dont les familles décrochent après 4–8 semaines quand l'effet nouveauté
s'estompe.

> **Conséquence sur le tri des features :** le timer/compagnons et les
> récompenses **sortent de la longue traîne « à supprimer »**. Ils deviennent le
> cœur de la surface mobile. (Cela amende explicitement la première version du
> plan, qui les listait comme candidats à la suppression.)

### 4.2 Une marque, trois offres

| Offre | Modèle | Rôle dans le funnel |
|---|---|---|
| **Articles / Ressources** | Gratuit, public (**ne jamais paywaller**) | Acquisition SEO — moteur de trafic |
| **Tokō Formation** (Barkley) | Achat unique **79–149 €**, landing dédiée | Milieu de funnel : monétise le trafic, construit la liste email, **vendable dès aujourd'hui** |
| **Tokō Famille** (SaaS suivi + rapport) | Abonnement **39 €/an** | Rétention : « mettez en pratique ce que vous venez d'apprendre » |

**Subtilité technique Barkley (610 loc API) = contenu + pratique :**
- **Contenu de formation** (`/steps`, parcours `formation/$stepNumber`) → séparable, c'est ce qui se vend en achat unique.
- **Couche pratique** (comportements cibles, logs quotidiens, récompenses, étoiles) → liée aux données enfant, **non séparable**. Elle reste dans l'app ; l'achat de la formation en déverrouille le contenu.

C'est cette combinaison (la formation enseigne, l'app fait exister la pratique)
qui différencie Tokō d'un simple cours vidéo. Une scission totale couperait ce
lien.

**Garde-fous formation :**
- Positionnement légal : « programme d'entraînement aux habiletés parentales
  *inspiré de la méthode* Barkley » — pas un soin, pas d'aval officiel implicite.
  Idéalement relu par un(e) psychologue (modèle Lusha × pédopsychiatres).
- Si un jour totalement autonome : Podia/Teachable ou checkout Stripe + pages
  privées (coût dev ≈ 0), mais on perd le pont vers la couche pratique.

---

## 5. Plan marketing

**Cible (ICP) :** parent francophone d'un enfant TDAH de 5–12 ans, diagnostiqué
ou en cours de diagnostic, avec des rendez-vous médicaux réguliers.

**Positionnement :** « Tokō — le carnet de suivi TDAH de votre enfant. Notez en
30 secondes par jour, arrivez au rendez-vous avec un rapport clair. » Un seul
message, partout.

**North Star Metric :** nombre de **rapports générés / rendez-vous préparés** par
mois (pas les DAU, pas les logs de features secondaires).

**Pricing :**
- **Gratuit** : suivi quotidien complet, 1 enfant, tendances 7 jours — le suivi
  reste gratuit pour alimenter le rapport.
- **Famille 39 €/an** (ou 4,99 €/mois), essai 14 j sans carte : rapport PDF
  illimité, historique complet, tendances mois/trimestre, 3 enfants, co-parent.
  Le rapport est LA raison de payer.
- **Formation 79–149 €** en achat unique (voir §4.2).
- Comparaison favorable : Joon ~12,99 $/mois ; Tokō Famille ~3,25 €/mois.

**Canaux d'acquisition (dans l'ordre) :**
1. **SEO francophone** — le hub `/ressources` existe ; le concentrer sur le
   parcours de soins (« préparer rendez-vous pédopsychiatre TDAH », « suivi
   méthylphénidate enfant effets secondaires », « attente diagnostic TDAH que
   faire », « programme Barkley en ligne »).
2. **Prescripteurs** : associations ([HyperSupers TDAH France](https://www.tdah-france.fr/)),
   groupes Facebook de parents, ateliers Barkley, à terme CRTDAH.
3. **Le rapport comme canal viral** : branding discret sur le PDF vu par les
   praticiens.
4. **Horizon 12 mois** : dossier mutuelles (précédent Lusha×AÉSIO) et
   partenariats praticiens (option E).

**KPIs (indicateurs, à valider qualitativement en pré-lancement — voir §6) :**
activation (% de comptes loggant ≥3 jours la 1ʳᵉ semaine), % d'actifs générant
un rapport avant un RDV, conversion essai→payant, rétention à 8 semaines (le
point de chute de Joon).

---

## 6. Plan technique consolidé

> **Changement de cadre majeur.** Le plan initial comportait une « Phase 0 —
> décider avec les données ». **Elle est annulée : il n'y a pas encore
> d'utilisateurs.** Sans analytics exploitable, sans coût de suppression et sans
> besoin de cycle feature-flags/observation, c'est le meilleur moment pour
> tailler franchement. On coupe **par conviction, immédiatement**.

### Phase 1 — Simplification visible (par conviction, tout de suite)

- [ ] **Supprimer directement** (pas de flag, pas de période d'observation) :
      Décodeur, Scripts, Forces, Succès, Activité, Burnout, Parcours de soins,
      Coffre-fort.
- [ ] **Périmètre conservé** : saisie quotidienne (journal + symptômes +
      médicaments fusionnés), routines + rappels, timer-compagnon (→ cœur
      mobile), rapport PDF, co-parent, liste de crise, Barkley (module contenu +
      pratique), compte/billing.
- [ ] **Navigation à 4–5 entrées max** : Aujourd'hui (dashboard), Suivi (saisie
      unique), Rapport, Enfant/Compte.
- [ ] **Dashboard = une action principale** : « Comment s'est passée la
      journée ? » (saisie 30 s) + compteur « Prochain rendez-vous dans X jours —
      votre rapport est prêt à Y % ».
- [ ] **Landing mono-CTA** (« Préparez votre prochain rendez-vous ») + retirer la
      liste exhaustive de features. Ajouter une **landing dédiée « Formation »**
      (le CTA principal du produit reste le rapport ; la formation a SA page).
- [ ] **Contenu** (Connaissances, Ressources, plan de crise) : conservé en libre
      accès pour le SEO, mais hors de la nav applicative principale.

### Phase 2 — Renforcer le cœur (4–6 semaines)

- [ ] **Fusionner la saisie quotidienne** (humeur + symptômes + médicament +
      note) en **un seul écran**, 30 secondes chrono — actuellement éclatée sur
      3–4 routes.
- [ ] **Rappels push quotidiens** via l'infra web push existante (`push.ts`,
      `push-sw.js`, cron `jobs.ts`) : « 30 s pour noter la journée de {prénom} »,
      avec onboarding d'opt-in soigné.
- [ ] **Améliorer le rapport** : courbe de réponse au traitement, effets
      secondaires, questions à poser au médecin ; branding Tokō discret en pied
      de page.
- [ ] **Barkley** : conservé comme module premium de contenu (aligné HAS,
      complément des ateliers) ; l'achat de la formation en déverrouille le
      contenu. Billing : ajouter un produit Stripe **one-shot** (`mode: payment`)
      à côté de l'abonnement — modification légère de `billing.ts`.

### Phase 3 — Premiers utilisateurs réels (bêta fermée, qualitative)

> La validation ne peut pas venir de l'analytics : elle vient d'une bêta
> recrutée à la main. Construire l'app native **avant** le premier utilisateur
> serait le piège classique du « build trap ».

- [ ] **Bêta fermée de 10–20 familles**, recrutées manuellement (groupes
      Facebook parents TDAH, HyperSupers TDAH France, entourage). Point
      hebdomadaire court avec chaque famille.
- [ ] Lancer la bêta sur **la PWA existante** avec rappels matin/soir et timer
      mis en avant comme action principale mobile — chemin le plus court vers de
      vrais utilisateurs.
- [ ] Mesurer (qualitatif + compteurs simples) : opt-in notifications, rappel →
      routine cochée, sessions timer/semaine, rétention à 8 semaines.
- [ ] **Test de demande Android à coût nul** : encart « L'application Android
      arrive — laissez votre email » sur la landing. Le compteur d'emails est le
      premier signal réel.

### Phase 4 — Compagnon Android natif (si la bêta le confirme)

**Critères de bascule (qualitatifs) :** rappels web push perçus comme
tardifs/manqués, enfants qui réclament le timer, demande explicite d'une « vraie
app », ou liste d'emails Android significative. Sur iOS, le push web exige la PWA
installée (friction réelle) ; le natif la supprime.

- [ ] Ressusciter `apps/mobile/` (Expo) en **compagnon 3 écrans** (routine matin,
      routine soir, timer-animal), **pas** en portage de l'app complète.
- [ ] Partage de session avec le compte web (Better Auth), **notifications
      locales exactes** (`expo-notifications`) synchronisées sur les horaires de
      routines — supérieures au web push pour un rappel à heure fixe (survivent
      au Doze, hors ligne), timer avec les compagnons existants.
- [ ] App **100 % gratuite, zéro achat in-app** ; l'abonnement reste géré sur le
      web. Fiche Play Store optimisée « routine enfant TDAH », « rappel routine
      matin enfant ».
- [ ] Si une présence Play Store suffit sans app native complète : publier une
      **TWA de la PWA** (coût quasi nul, Stripe web conservé, pas de commission
      Google sur le checkout web).

### Phase 5 — Horizon 12 mois (si traction validée)

- [ ] **Option E** : espace praticien en lecture (le parent partage un lien de
      rapport), dossier mutuelles/CRTDAH.
- [ ] Page `developers`/MCP/CLI : sortir du produit grand public (sous-domaine ou
      README).
- [ ] Réévaluer un éventuel produit enfant gamifié **uniquement** si la NSM est
      solide et financée.

---

## 7. Décisions explicites — ce qu'on NE fait PAS

- Pas de découpage en plusieurs apps aujourd'hui : cela multiplierait les coûts
  de dev et de marketing alors que le problème est l'excès de surface, pas son
  emballage.
- Pas d'app Android native **comme produit principal** : elle n'est qu'un
  **compagnon gratuit 3 écrans**, déclenché seulement si la bêta le justifie.
- Pas d'affrontement frontal avec Joon/Lusha/Tiimo sur la gamification enfant.
- Pas de paywall sur les Articles/Ressources : c'est le moteur d'acquisition SEO.
- Pas de « Phase 0 pilotée par les données » : produit en pré-lancement, on coupe
  par conviction.
- Pas de certification HDS à ce stade : trop de contraintes pour un produit en
  pré-lancement. À réévaluer uniquement si l'option E (praticiens, mutuelles,
  CRTDAH) se concrétise. La conformité RGPD, elle, est traitée dès maintenant —
  voir `docs/rgpd-compliance.md`.

---

## 8. Séquence en une ligne

**Simplifier (couper par conviction) → premiers utilisateurs réels (bêta PWA) →
compagnon natif si confirmé.** Trois offres sous une seule marque : Ressources
(SEO, gratuit) → Formation Barkley (achat unique, vendable maintenant) → Famille
(abonnement, rapport médical = cœur).

---

*Consolidation de l'issue #335 et de ses trois affinages (app Android compagnon,
correction pré-lancement, Barkley offre indépendante). Sources marché :
[Grand View Research](https://www.grandviewresearch.com/industry-analysis/adhd-apps-market-report),
[The Business Research Company](https://www.thebusinessresearchcompany.com/report/attention-deficit-hyperactivity-disorder-adhd-apps-global-market-report),
[Global Growth Insights](https://www.globalgrowthinsights.com/market-reports/adhd-apps-market-122250),
[handicap.gouv.fr](https://handicap.gouv.fr/une-avancee-historique-pour-le-tdah-creation-dune-filiere-de-soins-dediee-et-labellisation-de-centres-ressources-regionaux),
[HAS](https://www.has-sante.fr/jcms/p_3302482/fr/trouble-du-neurodeveloppement/tdah-diagnostic-et-interventions-therapeutiques-aupres-des-enfants-et-adolescents),
[TDAH France](https://www.tdah-france.fr/Programme-d-entrainement-aux-habiletes-parentales-de-Barkley.html),
[Joon](https://www.joonapp.io/), [Lusha/Dygie](https://lusha.care/),
[AÉSIO×Dygie](https://ensemble.aesio.fr/agir-ensemble/partenaires/social-et-solidaire/dygie-lusha),
[Choosing Therapy (Joon review)](https://www.choosingtherapy.com/joon-app-review/).*
