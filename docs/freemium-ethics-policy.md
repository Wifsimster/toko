# Politique éthique freemium — Tokō

Tokō s'adresse à des parents atteints de TDAH qui gèrent des enfants atteints de TDAH. Toute mécanique de monétisation doit respecter les règles ci-dessous. Cette politique est **opposable** : aucune feature freemium ne peut être livrée sans audit contre ce document.

Ces règles découlent de la réunion personas du 2026-05-10 (parent TDAH, pédopsychiatre, PM B2C, UX accessibilité cognitive) et des principes produit définis dans `CLAUDE.md` (charge cognitive minimale, pas de surprises, tolérance aux erreurs).

## 1. Contenu de sécurité — toujours gratuit

Les contenus suivants sont **gratuits à vie**, sans cadenas, sans blur, sans dégradation visuelle. Aucune exception, aucun A/B test n'est autorisé sur ce périmètre.

- **S.O.S. Crise** et toutes ses techniques (respiration, 5 sens, diversion)
- **Liste de crise** (custom items, mode crise, suggestions par défaut)
- **Guides de désescalade** et co-régulation
- **Prévention de la maltraitance** et du dérapage éducatif
- **Repères de sécurité enfant** (fugue, automutilation, idées suicidaires)
- **Numéros d'écoute et d'urgence** (3114, Allô Parents Bébé, HyperSupers)

**Règle technique** : tout composant de paywall (`Paywall`, `Lock`, `Premium`, `BlurOverlay`, `Teaser`…) doit refuser de s'appliquer à un slug de ce périmètre. Le refus doit être garanti par une whitelist + un test unitaire.

## 2. Pas de nudge sur signal de détresse

Aucune mécanique de conversion ne doit se déclencher sur un signal de détresse parentale. Sont notamment interdits :

- Pop-up upsell après consultation répétée de contenus crise
- Bannière "achetez avant J+5" pendant un défi en cours
- Notification sur la base d'un score d'usage anxiogène (« vous avez 3 crises de plus que la semaine dernière »)
- Confirmshaming (« Vous laissez vos crises sans réponse ? »)

À la place : afficher gratuitement un message déculpabilisant + les numéros d'écoute. Le suivi analytique de ces signaux peut exister pour dimensionner le contenu gratuit, jamais pour déclencher un upsell.

## 3. Pas de paywall sur la donnée que l'utilisateur produit

L'utilisateur reste propriétaire de ses données. Le paywall peut s'appliquer sur :

- L'**interprétation** des données (insights, analyses, recommandations contextualisées)
- Les **plans personnalisés** générés
- L'**historique long** (au-delà de 30 jours, par exemple)

Mais pas sur la saisie ni la consultation récente. L'utilisateur peut toujours exporter ses données (PDF/CSV) gratuitement pour le suivi médical.

## 4. Transparence radicale

- **Catalogue Gratuit / Premium** visible dès l'onboarding, pas découvert au fil du parcours.
- **Essai 14 jours sans carte bancaire**, accès complet, zéro cadenas pendant l'essai.
- Notification J-2 et J-0 avant fin d'essai, en langage clair, sans urgence artificielle.
- **Annulation en 2 clics**, sans questionnaire de rétention bloquant.
- **Tarif solidaire** disponible pour parents en difficulté, formulaire court, déclaratif.

## 5. Pas de "Diagnostic" auto-administré

Aucune feature (quiz, questionnaire, score) ne peut utiliser le mot **« diagnostic »** dans une copie utilisateur. Un diagnostic de TDAH se pose après évaluation clinique multi-sources sur plusieurs mois. L'app peut proposer un **profil** pour personnaliser l'expérience, accompagné d'un disclaimer médical visible et d'un lien vers une ressource professionnelle (HyperSupers, annuaire pédopsy).

## 6. Pas de dark patterns

Refusés explicitement (taxonomie de Harry Brignull) :

- **Bait & Switch** : promettre du contenu puis le bloquer après engagement.
- **Roach Motel** : faciliter l'entrée, rendre la sortie douloureuse (annulation cachée, formulaires de rétention).
- **Confirmshaming** : culpabiliser l'utilisateur qui n'achète pas (« Non merci, je préfère continuer à galérer »).
- **Forced Continuity** : prélèvement automatique non signalé après essai gratuit.
- **Visual blur teasing** sur du contenu de sécurité ou de désescalade.

## 7. Tests utilisateurs avant launch payant

Aucune mécanique freemium nouvelle ne peut être livrée en production sans avoir été testée sur **n=8 parents TDAH minimum** dans un scénario de stress (« crise simulée à 21h »). Critère d'arrêt : si > 60% d'abandon ou verbatims émotionnels négatifs majoritaires sur une mécanique, elle est tuée avant launch.

## 8. Nord star metric

La valeur produit se mesure par **« crises désamorcées par parent actif par semaine »**, pas par la conversion. Un nudge qui dégrade la north star metric est tué, même s'il augmente la conversion à court terme.

---

## Procédure de revue

Toute PR introduisant une mécanique de monétisation (paywall, upsell, nudge, A/B test sur conversion) doit :

1. Citer cette politique dans la description de la PR.
2. Lister les règles applicables et expliquer comment elles sont respectées.
3. Inclure un test unitaire sur les whitelists de contenu de sécurité (règle 1).
4. Faire l'objet d'une revue par un humain (pas de merge auto).

## Références

- Réunion personas du 2026-05-10 (issue #176)
- Principes produit `CLAUDE.md` § Audience & Design Principles
- WCAG 2.2 cognitive AAA
- Taxonomie des dark patterns (Harry Brignull, deceptive.design)
- Numéros d'écoute : 3114 (prévention suicide), 0 800 235 236 (Allô Parents Bébé), HyperSupers TDAH France
