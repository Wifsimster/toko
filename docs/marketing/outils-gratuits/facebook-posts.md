# Tokō : un post par outil gratuit (page + groupes Facebook)

## Règles

- **Un outil par post**, trois posts par semaine (lundi, mercredi, samedi vers 20 h 30). Pas d'annonce groupée, sauf le récapitulatif n° 8.
- **Le lien va en premier commentaire**, jamais dans le post (règle de la page Tokō).
- **Un lien UTM par groupe et par post** : `docs/marketing/outils-gratuits/lien-utm.sh "<nom du groupe>" <outil>`. Pour la page Tokō : `./lien-utm.sh page <outil>`.
  Ça donne `utm_source=fb-<groupe>` (où) et `utm_campaign=<outil>-<AAAAMM>` (quel post).
- Dans un groupe qui interdit les liens : poster seulement le texte, et donner le lien en message privé à qui le demande.
- Répondre aux commentaires en humain, avec la réponse dans le commentaire, pas seulement un lien.
- Jamais d'information sur nos enfants. Jamais « soigne », « guérit », « traitement ». Pas de mot qui juge l'enfant ou le parent.

## Où lire les résultats

- **Umami (Tokō)** : rapport UTM → visites par `utm_source` (groupe) et `utm_campaign` (post).
- Évènements : `outil-clic` {outil, depuis} (clic sur une carte d'outil), `outil-utilise` {outil} (impression ou PDF), `cta_clicked` avec `location` = `outil_carnet_sommeil`, `outil_preparer_rdv`, `outil_routine` (clic « Essayer Tokō » en bas d'un outil), puis `signup_started`.
- Lecture : visites → `outil-utilise` = l'outil sert ; `outil-utilise` → `cta_clicked` = l'outil amène vers Tokō.

## Calendrier

| # | Date | Outil | Clé `lien-utm.sh` |
|---|---|---|---|
| 1 | lun. 9 nov. | Carnet de sommeil | `carnet-de-sommeil` |
| 2 | mer. 11 nov. | Routine en images | `routine` |
| 3 | sam. 14 nov. | Mon enfant en une page | `fiche-enfant` |
| 4 | lun. 16 nov. | Par où commencer avec la MDPH ? | `mdph` |
| 5 | mer. 18 nov. | Préparer le rendez-vous | `preparer-rendez-vous` |
| 6 | sam. 21 nov. | Plan de crise | `plan-de-crise` |
| 7 | lun. 23 nov. | Questionnaires Repères (relance avec UTM) | `quiz` |
| 8 | mer. 25 nov. | Tous les outils (récapitulatif, lien à épingler) | `outils` |

---

## 1. Carnet de sommeil

> 21 h 30, l'histoire est finie, la lumière est éteinte. Et une heure plus tard, il chante encore dans son lit.
>
> Chez une partie des enfants TDAH, l'horloge interne est réglée plus tard : le signal du sommeil arrive après l'heure du coucher. Le médecin peut le repérer, à condition d'avoir des faits plutôt qu'un « il dort mal » au rendez-vous.
>
> J'ai mis en ligne un carnet de sommeil à imprimer. Deux semaines, une ligne par repère : coucher, endormissement, réveils, lever, écrans le soir, lumière du jour le matin. On le remplit chaque matin en deux minutes, sans chercher la minute près.
>
> Gratuit, sans compte. Vous pouvez y mettre le prénom et le premier jour, rien n'est envoyé.
>
> Le lien est en commentaire.

**Premier commentaire :** Le carnet de sommeil : [lien UTM]. L'article sur l'horloge interne est relié en bas de la page.

## 2. Routine en images

> « Tu as mis tes chaussures ? » Quatrième fois ce matin.
>
> Une routine affichée en images fait ce rappel à notre place. L'enfant regarde où il en est, coche sa case, et passe à la suivante.
>
> J'ai fait un petit outil pour la créer : vous choisissez le matin ou le soir, vous gardez les étapes qui comptent chez vous, vous les mettez dans l'ordre. Ça s'imprime sur une page, en grands dessins, avec une case par jour de la semaine.
>
> Huit étapes au plus. Avec moins, c'est plus facile à suivre.
>
> Le lien est en commentaire. Gratuit, sans compte.

**Premier commentaire :** Pour créer la routine : [lien UTM]

## 3. Mon enfant en une page

> Nouvelle AESH, remplaçante en classe, centre de loisirs le mercredi. À chaque fois, il faut tout réexpliquer, souvent en deux minutes devant le portail.
>
> J'ai fait une fiche à remplir une fois et à donner à chaque nouvel adulte : ce qui aide votre enfant, ce qui est difficile pour lui, les signes que ça monte, ce qui l'apaise, les aménagements déjà en place, comment vous joindre.
>
> La plupart des réponses se cochent. Ce que vous laissez vide s'imprime en lignes, pour l'écrire à la main.
>
> Rien n'est envoyé ni enregistré : imprimez-la ou gardez le PDF.

**Premier commentaire :** La fiche « Mon enfant en une page » : [lien UTM]

## 4. Par où commencer avec la MDPH ?

> PAP, PPS, AESH, GEVASCO, AEEH. La première fois qu'on entend tout ça dans un bureau d'école, on ressort avec plus de sigles que de réponses.
>
> J'ai fait un petit parcours en trois questions : ce que vous cherchez (de l'aide à l'école, une aide pour les frais, un suivi), ce dont votre enfant aurait besoin en classe, et son âge.
>
> À la fin, vous savez quoi demander et à qui. Par exemple, le PAP se demande à l'école, sans dossier MDPH. Vous avez aussi la liste des papiers à réunir, avec les numéros des formulaires, à imprimer et cocher.
>
> Les montants de l'AEEH viennent de service-public, avec la date de vérification. Votre MDPH reste la référence pour votre situation.

**Premier commentaire :** Le parcours MDPH : [lien UTM]

## 5. Préparer le rendez-vous

> Des mois d'attente, puis une consultation qui passe vite. On ressort en pensant à la question qu'on voulait poser.
>
> J'ai fait une page à remplir la veille : la chose la plus importante à dire, ce qui a changé depuis la dernière fois, un exemple récent, les médicaments et ce que vous remarquez, vos questions. Une place est laissée pour noter les réponses du médecin pendant le rendez-vous.
>
> Des questions sont proposées si vous ne savez pas par où commencer : quels bilans faire, que dire à l'école, quand se revoir.
>
> Gratuit, sans compte, rien n'est envoyé.

**Premier commentaire :** Pour préparer le rendez-vous : [lien UTM]

## 6. Plan de crise

> Pendant une crise, personne ne réfléchit bien, ni l'enfant ni nous.
>
> Le plan de crise se remplit au calme, un soir où tout va bien. Trois colonnes : les signes que ça monte, ce que je fais, ce que je ne fais plus. On l'affiche sur le frigo, et le jour où ça déborde, on n'a plus qu'à le lire.
>
> Le modèle est gratuit, à imprimer, à remplir à la main. L'écrire soi-même aide à s'en souvenir.

**Premier commentaire :** Le modèle de plan de crise : [lien UTM]

## 7. Questionnaires Repères (relance)

> « Est-ce que c'est un TDAH ? » Beaucoup de parents se posent la question pendant les mois d'attente.
>
> Les questionnaires Repères partent de scènes du quotidien : les devoirs qui durent une heure, le projet bloqué à 90 %. Chaque scène reprend une question des outils des professionnels, avec leur calcul. De 2 à 8 minutes, pour votre enfant ou pour vous.
>
> Ce n'est pas un avis médical : seul un professionnel peut conclure. Le résultat sert à arriver au rendez-vous avec des exemples précis, et il s'imprime pour le médecin.
>
> Vos réponses restent sur votre téléphone.

**Premier commentaire :** Les questionnaires : [lien UTM]

## 8. Tous les outils (récapitulatif)

> J'ai regroupé les outils gratuits de Tokō sur une seule page : questionnaires de repérage, carnet de sommeil, routine en images, fiche pour l'école, préparation du rendez-vous, parcours MDPH, plan de crise, lexique des sigles.
>
> Tous gratuits, sans compte, et rien de ce que vous tapez ne quitte votre téléphone.
>
> Si un outil vous manque, dites-le en commentaire.

**Premier commentaire :** Tous les outils : [lien UTM] (c'est aussi le lien à épingler sur la page).

---

## Variante courte (stories, WhatsApp)

Un outil, une phrase, un lien (`docs/marketing/outils-gratuits/lien-utm.sh whatsapp <outil>`) :

- **Carnet de sommeil** : deux semaines de coucher et de réveil à noter, prêtes pour le médecin.
- **Routine en images** : les étapes du matin ou du soir en grands dessins, à cocher.
- **Mon enfant en une page** : la fiche à donner à l'AESH ou au centre de loisirs.
- **MDPH** : trois questions pour savoir quoi demander et quels papiers réunir.
- **Préparer le rendez-vous** : vos questions et vos exemples, sur une page.
