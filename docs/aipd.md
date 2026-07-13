# AIPD — Analyse d'impact relative à la protection des données

> Version préliminaire (juillet 2026). Le traitement de **données de santé
> d'enfants** relève de la liste CNIL des traitements pour lesquels une AIPD est
> requise. Ce document en constitue la base ; il doit être finalisé et validé
> (idéalement avec un DPO/conseil) **avant le lancement public** — la bêta
> fermée (Phase 3 du plan produit) est le bon moment pour le compléter avec les
> premiers retours réels.

## 1. Description du traitement

- **Finalité :** aider les parents à suivre le quotidien d'un enfant concerné
  par le TDAH et à préparer les rendez-vous médicaux (rapport de suivi).
- **Nature :** collecte quotidienne (symptômes, humeur, sommeil, traitements,
  journal, routines), stockage de documents médicaux, génération de rapports.
- **Personnes concernées :** enfants (données de santé, art. 9), parents
  titulaires, co-parents invités, praticiens destinataires d'un rapport.
- **Données sensibles :** diagnostic TDAH, symptômes, médicaments et effets
  secondaires, documents médicaux (bilans, ordonnances, MDPH), humeur du parent.
- **Périmètre :** francophone, hébergement UE, pré-lancement (0 utilisateur).

## 2. Nécessité et proportionnalité

- **Base légale :** consentement explicite du titulaire de l'autorité parentale
  (art. 9.2.a) pour les données de santé ; exécution du contrat pour le compte
  et la facturation.
- **Minimisation :** tranche d'âge au lieu de la date de naissance ; prénom seul
  (chiffré) ; pas d'appel IA externe ; mesure d'audience sans cookie ; IP de
  session purgée < 24 h ; rapport PDF jamais stocké ; export/suppression natifs.
- **Durées :** vie du compte ; effacement ≤ 30 j après demande ; events 13 mois ;
  audit 3 ans (cf. registre §13 de `rgpd-compliance.md`).
- **Droits :** accès/portabilité (export complet), rectification (édition),
  effacement (suppression immédiate ou différée 30 j), opposition/retrait du
  consentement, réclamation CNIL — tous exposés dans l'app et les pages légales.

## 3. Risques et mesures

| Risque | Impact | Mesures en place |
|---|---|---|
| Accès non autorisé aux données de santé | Élevé | Auth (Better Auth, 2FA/passkey), scoping par `parentId`/`childAccess`, HTTPS, chiffrement au repos du prénom, de l'`audit_log.summary` et du **coffre-fort médical** |
| Fuite via sous-traitant | Élevé | Sous-traitants limités et UE (Stripe, Resend) ; aucun tracker tiers ; aucun LLM externe ; effacement propagé à Stripe |
| Perte de données | Moyen | Sauvegardes chiffrées quotidiennes (`deploy/backup.sh`), stockage UE |
| Sur-collecte / rétention excessive | Moyen | Minimisation (voir §2), TTL events/audit, purge des invitations expirées |
| Consentement non valable (enfant) | Élevé | Consentement art. 9 + attestation d'autorité parentale à l'inscription et à la création d'enfant ; retrait possible |
| Accès via clé programmatique | Moyen | Clés en lecture seule, hachées, allowlist deny-by-default excluant coffre-fort/export/suppression/billing/admin |
| Réidentification via logs/analytics | Faible | Redaction PII dans les logs ; pas d'UUID enfant dans les URLs analytics |

## 4. Risques résiduels à traiter avant le lancement public

- Chiffrement au niveau colonne des textes libres de santé (symptômes, journal,
  effets secondaires) — actuellement en clair, protégés par la sécurité du
  volume et le chiffrement disque (décision : cf. `rgpd-compliance.md §9`).
- Scoping des clés programmatiques par enfant (défense en profondeur, P2).
- Test de restauration des sauvegardes et réplication hors-site UE.
- Finalisation juridique des CGU et des mentions légales.

## 5. Avis

À compléter : consultation du DPO (le cas échéant) et, si le risque résiduel
reste élevé, consultation préalable de la CNIL avant le lancement public.
