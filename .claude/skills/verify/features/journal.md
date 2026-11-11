# Journal

Free-text notes per child and date, with tags (École, Victoire, Crise, Traitement, Sommeil, Sport, Thérapie). Entries show on `/journal`, with search and tag filters, and in the report's "Moments marquants du journal".

## Sub-features

- `journal-add`: "Écrire" opens the "Nouvelle entrée" dialog (Date, Notes, tag toggle buttons). "Ajouter l'entrée" stays disabled until Notes has text. It POSTs `/api/journal` (201). Tags are stored as English keys (`victory`, `school`, ...).
- `journal-list`: one card per entry (two entries on one day make two cards), each with its tags and an "Actions sur l'entrée" button, search ("Rechercher dans les notes..."), and tag filter chips.
- `journal-quick-note`: an inline note with tags (Victoire, Crise, École, Sommeil) and "Enregistrer la note", which POSTs `/api/journal` (201). On `/journal` it is the region "Et aujourd'hui, pour <name> ?" above the list; the dashboard has its own "Suivi rapide" variant (not scripted).
- `journal-edit-delete`: the card's "⋮" menu. Not scripted.

## How to get to it (user POV)

- The sidebar link "Journal" (under "Au quotidien"), or `/journal`. `/suivi` redirects to `/journal`.
- On the dashboard, « Commencer » on the « une seule chose » card when the reading is done but today's entry is missing (« Écrire un mot sur la journée de … »).

## Driving it with control-toko

Preconditions:

- `$C login` succeeded, and the child exists.

- **Add.** Run `$C journal add --child "Pilote Fictif" --text "Entrée synthétique : bonne matinée (verify)" --tags "Victoire,École"`. The result has `response.status: 201`, `dbRow.tags: ["victory","school"]` and `visibleOnJournalPage: true`. `journal-result.png` shows the card with both tags.
- **Quick note.** `$C goto /journal`, then `$C fill --placeholder "^Une victoire, une difficulté" --value "Note rapide synthétique (verify)"`, `$C click --role button --name "^Sommeil$" --within main` (the first match is the note's chip, the second the list filter), `$C click --role button --name "^Enregistrer la note$"`: `POST /api/journal` 201 with `tags: ["sleep"]`. Then `$C db "select text, tags from journal_entries order by created_at desc limit 1"`. `fill --label "Et aujourd"` fails: the label also names the section, which comes first.
- **Downstream.** `$C goto /report`, then `$C screenshot --full-page`. The entry appears under "Moments marquants du journal".

## Gotchas

- `journal_entries.text` is stored in plaintext, unlike `children.name`.
- A child with no entries shows a Mō empty state: `heading "Votre journal est vide"` (no period) and "Commencez à écrire vos premières observations.".
