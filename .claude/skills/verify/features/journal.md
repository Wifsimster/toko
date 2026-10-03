# Journal

Free-text notes per child and date, with tags (École, Victoire, Crise, Traitement, Sommeil, Sport, Thérapie). Entries show on `/journal`, with search and tag filters, and in the report's "Moments marquants du journal".

## Sub-features

- `journal-add`: "Écrire" opens the "Nouvelle entrée" dialog (Date, Notes, tag toggle buttons). "Ajouter l'entrée" stays disabled until Notes has text. It POSTs `/api/journal` (201). Tags are stored as English keys (`victory`, `school`, ...).
- `journal-list`: day cards with tags, search ("Rechercher dans les notes..."), and tag filter chips.
- `journal-quick-note`: the dashboard "Suivi rapide" evening note ("Note du jour" plus tags). Not scripted.
- `journal-edit-delete`: the card's "⋮" menu. Not scripted.

## How to get to it (user POV)

- The sidebar "Suivi", then Journal, or `/journal`.
- The dashboard "Écrire dans le journal" link.

## Driving it with control-toko

Preconditions:

- `$C login` succeeded, and the child exists.

- **Add.** Run `$C journal add --child "Pilote Fictif" --text "Entrée synthétique : bonne matinée (verify)" --tags "Victoire,École"`. The result has `response.status: 201`, `dbRow.tags: ["victory","school"]` and `visibleOnJournalPage: true`. `journal-result.png` shows the card with both tags.
- **Downstream.** `$C goto /report`, then `$C screenshot --full-page`. The entry appears under "Moments marquants du journal".

## Gotchas

- `journal_entries.text` is stored in plaintext, unlike `children.name`.
- A child with no entries shows "Votre journal est vide.".
