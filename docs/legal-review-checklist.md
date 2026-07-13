# Checklist de revue juridique — avant lancement public

Les textes juridiques et l'AIPD ont été rédigés à partir de l'application telle
que construite (faits vérifiables), mais **doivent être validés par un
professionnel du droit** avant l'ouverture au public. Ce document liste
précisément ce qui reste à trancher, pour un aller-retour efficace.

## 1. Identité et coordonnées (à renseigner)

Les pages actuelles disent « édité à titre personnel » sans identité complète.
Le professionnel doit confirmer les mentions obligatoires (LCEN / RGPD) :

- [ ] Nom / raison sociale de l'éditeur (responsable de traitement)
- [ ] Adresse postale de contact
- [ ] Email de contact pour l'exercice des droits (aujourd'hui : page de contact)
- [ ] Le cas échéant : SIRET, directeur de la publication, DPO
- [ ] Coordonnées précises de l'hébergeur (actuellement « UE / OVH » générique)

Fichiers : `apps/web/src/lib/i18n/locales/fr.json` → clés `legal.*`.

## 2. CGU (`/cgu`, clés `cgu.*`)

Contenu de base fourni ; à faire valider :

- [ ] Clauses de responsabilité et de garantie (limites conformes au droit conso.)
- [ ] Conditions d'abonnement, rétractation (14 j) et remboursement
- [ ] Clause de résiliation / suspension de compte
- [ ] Droit applicable et juridiction compétente (actuellement : droit français)
- [ ] Cohérence avec le statut « non-dispositif médical »

## 3. Politique de confidentialité (`/confidentialite`, clés `privacy.*`)

- [ ] Durées de conservation par catégorie (cf. registre art. 30, §13 de
      `rgpd-compliance.md`) — confirmer les valeurs (events 13 mois, audit 3 ans,
      compte : effacement ≤ 30 j)
- [ ] Liste des sous-traitants exhaustive et exacte (Stripe, Resend, Google)
- [ ] Formulation du consentement art. 9 (données de santé de l'enfant)
- [ ] Base légale de la mesure d'audience (intérêt légitime / exemption CNIL)

## 4. AIPD (`docs/aipd.md`)

- [ ] Compléter avec les retours de la bêta fermée (Phase 3 du plan produit)
- [ ] Valider l'analyse des risques et la proportionnalité
- [ ] Décider si une **consultation préalable de la CNIL** est nécessaire
- [ ] Trancher les risques résiduels documentés (chiffrement des textes libres,
      scoping des clés) — décisions actuelles dans `rgpd-compliance.md §9/§11`

## 5. Consentement enfant / autorité parentale

- [ ] Confirmer que l'attestation d'autorité parentale + consentement art. 9
      capturés à l'inscription et à la création d'enfant suffisent juridiquement
- [ ] Vérifier le traitement du cas des parents séparés / co-parent

## 6. Points déjà couverts (pour information)

Consentement versionné et horodaté, export/suppression RGPD natifs, chiffrement
au repos des données les plus sensibles, sous-traitants UE uniquement, aucun
transfert hors UE, aucun tracker tiers, désinscription one-click, registre des
traitements (art. 30). Détail et références de code dans `docs/rgpd-compliance.md`.
