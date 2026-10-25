# Daily symptoms

One reading per child per day, on five 0-10 sliders (Agitation, Concentration, Impulsivité, Régulation émotionnelle, Sommeil), plus "routines tenues", Contexte and Notes. Readings feed the dashboard trends and the report.

## Sub-features

- `symptom-create`: on `/symptoms`, "Ajouter" opens the "Nouveau relevé" dialog.
  - Date, with "Aujourd'hui" and "Hier" buttons.
  - The "Raccourcis" shortcuts "Journée calme" and "Journée difficile".
  - The five sliders, the routines checkbox, Contexte and Notes.
  - "Enregistrer le relevé" POSTs `/api/symptoms` (201).
- `symptom-update`: the same dialog when the date already has a reading.
  - It shows the alert "Un relevé existe déjà pour cette date. Vos modifications le remplaceront.".
  - It hides the shortcuts.
  - "Mettre à jour le relevé" sends a PATCH (200).
- `symptom-list`: the history on `/symptoms`.
  - One `EntryCard` per reading: the date as an `h2`, the author and the context below it, and Modifier/Supprimer buttons named after the date ("Modifier le relevé du dimanche 25 octobre").
  - The day summary is a `MoodBadge` (Mō of the shared mood table, `aria-hidden`, on its pastel), inside a button with `aria-expanded` that shows the five dimensions as text levels (Bon, Moyen, Difficile).
  - The filters are `FilterChips`: a group "Filtrer les relevés" of toggle buttons with `aria-pressed`, plus a hidden live region ("21 relevés affichés").
  - Empty, no-child and no-match states are `EmptyState` with Mō.

## How to get to it (user POV)

- The sidebar "Suivi", then Symptômes, or `/symptoms` directly.
- The dashboard "Enregistrer les symptômes" link.

## Driving it with control-toko

Preconditions:

- `$C login` succeeded, and the child exists.

- **Create.** On a new child, run `$C symptom log --child "Pilote Fictif" --preset difficile --context "Mercredi fictif" --notes "Relevé synthétique (verify)"`. The result has `mode: "create"`, `response.method: "POST"` and `status: 201`. `dbRow` holds `agitation 8, focus 3, impulse 8, mood 3, sleep 4, routines_ok false` (the "Journée difficile" preset).
- **Update.** Lucas has a seeded reading for today. Run `$C symptom log --child Lucas --notes "Mise à jour synthétique"`. The result has `mode: "update ..."`, `presetApplied: false`, `PATCH` and `200`. Then `$C db "select count(*), max(notes) from symptoms where child_id='00000000-0000-4000-a000-000000001001' and date=current_date"` returns `1` and the new notes.
- **Downstream.** `$C goto /report` shows the averages of the new reading (see `report.md`).

## Gotchas

- The card's delete button is an `AlertDialogTrigger`, which also carries `aria-expanded`. To expand a card, target `main article button[aria-controls^=symptom-details]`, not `button[aria-expanded]`.

- Each slider is named by its label (ARIA `slider "Agitation": "5"`), so `$C snapshot --selector "[role=dialog]"` shows the five values by name.
- The DB columns are `focus`, `impulse` and `mood`, not the UI words.
- Notes are stored in plaintext.
