# Daily symptoms

One reading per child per day, on five 0-10 sliders (Agitation, Concentration, Impulsivité, Régulation émotionnelle, Sommeil), plus "routines tenues", Contexte and Notes. Readings feed the dashboard trends and the report.

## Sub-features

- `symptom-create`: on `/symptoms`, "Ajouter" opens the "Nouveau relevé" dialog.
  - Date, with "Aujourd'hui" and "Hier" buttons.
  - The "Raccourcis" shortcuts "Journée calme" and "Journée difficile", plus "Journée typique" (copies the latest reading) once the child has a reading.
  - On a date with no reading, for a child who has readings, the sliders start from the latest reading, under "Valeurs pré-remplies à partir du dernier relevé." with a "Réinitialiser" button. Reach it with "Ajouter", then "Hier", on a child whose only reading is today's.
  - The five sliders, the routines checkbox, Contexte and Notes.
  - "Enregistrer le relevé" POSTs `/api/symptoms` (201).
- `symptom-update`: the same dialog when the date already has a reading.
  - It shows the alert "Un relevé existe déjà pour cette date. Vos modifications le remplaceront.".
  - It hides the shortcuts.
  - "Mettre à jour le relevé" sends a PATCH (200).
- `symptom-list`: the history on `/symptoms`.
  - One `EntryCard` per reading: the date as an `h2`, the author and the context below it, and Modifier/Supprimer buttons named after the date ("Modifier le relevé du dimanche 25 octobre").
  - The day summary is a `MoodBadge mo={false}`: no Mō in the history, only the pastel (good on mint, mixed on sand `bg-muted`, hard on peach) and the label. It sits in a button with `aria-expanded` and `data-level` (`good`, `ok`, `hard`) that shows the five dimensions as text levels (Bon, Moyen, Difficile).
  - The filters are `FilterChips`: a group "Filtrer les relevés" of toggle buttons with `aria-pressed`, on one scrolling line (thin scrollbar) below `sm`, wrapped from `sm` (640 px, so also desktop at 200 %); a focused chip scrolls fully into view. A hidden live region announces the count ("1 relevé affiché") after a filter change only; it is empty on load.
  - Mō appears only in the empty states and in the form's shortcuts row (one Mō beside "Journée calme", one beside "Journée difficile").
  - Empty, no-child and no-match states are `EmptyState` with Mō.

## How to get to it (user POV)

- The sidebar link "Suivi" opens the `/suivi` hub, then Symptômes; or `/symptoms` directly.
- On the dashboard, « Commencer » on the « une seule chose » card when today's reading is missing.

## Driving it with control-toko

Preconditions:

- `$C login` succeeded, and the child exists.

- **Create.** On a new child, run `$C symptom log --child "Pilote Fictif" --preset difficile --context "Mercredi fictif" --notes "Relevé synthétique (verify)"`. The result has `mode: "create"`, `response.method: "POST"` and `status: 201`. `dbRow` holds `agitation 8, focus 3, impulse 8, mood 3, sleep 4, routines_ok false` (the "Journée difficile" preset).
- **Update.** Lucas has a seeded reading for today. Run `$C symptom log --child Lucas --notes "Mise à jour synthétique"`. The result has `mode: "update ..."`, `presetApplied: false`, `PATCH` and `200`. Then `$C db "select count(*), max(notes) from symptoms where child_id='00000000-0000-4000-a000-000000001001' and date=current_date"` returns `1` and the new notes.
- **Downstream.** `$C goto /report` shows the averages of the new reading (see `report.md`).

## Gotchas

- `e2e/fixtures/symptoms.ts` serves a synthetic `GET /api/symptoms/:childId` (one good, one mixed, one hard day) through `page.route`. The demo seed has almost only mixed days, so use the fixture to check the mint and peach pastels.

- The card's delete button is an `AlertDialogTrigger`, which also carries `aria-expanded`. To expand a card, target `main article button[aria-controls^=symptom-details]`, not `button[aria-expanded]`.

- Each slider is named by its label (ARIA `slider "Agitation": "5"`), so `$C snapshot --selector "[role=dialog]"` shows the five values by name.
- The DB columns are `focus`, `impulse` and `mood`, not the UI words.
- Notes are stored in plaintext.
