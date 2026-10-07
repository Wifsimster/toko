# Children

A parent manages one or more children. The sidebar combobox picks the active child, and every tracking page is scoped to it. The child name is AES-256-GCM encrypted at rest (`children.name`, prefix `enc::v1::`, key `DB_ENCRYPTION_KEY`). The API decrypts it.

## Sub-features

- `child-add`: the "Ajouter un enfant" dialog.
  - Prénom, plus a random-nickname button for privacy.
  - Once a name is typed, "Tranche d'âge" (0-5, 6-8, 9-11, 12-14, 15-17) and the RGPD art. 9 consent checkbox appear. "Ajouter" stays disabled until both are set.
  - A "Détails optionnels" group.
  - It POSTs `/api/children` (201).
- `child-select`: the sidebar combobox "Enfant suivi", with options like "👦 Lucas 6-8 ans".
- `child-actions`: "Actions pour <name>" (edit, delete). Not scripted.
- `child-access`: co-parent invitations. Not scripted.

## How to get to it (user POV)

- The "+" button ("Ajouter un enfant") next to the child selector in the sidebar.
- The welcome screen of a parent with no child.

## Driving it with control-toko

Preconditions:

- `$C login` succeeded.

- **Add.** Run `$C child add --name "Pilote Fictif" --age 9-11`. The result has `response.status: 201` and a `childId`. `dbRow.name` starts with `enc::v1::`, `nameEncryptedAtRest` is `true`, and `apiReadBack.name` is "Pilote Fictif". The evidence is `child-add-filled.png` and `child-add-result.png`.
- **The list.** Run `$C api /api/children`. It returns Lucas, Emma and Pilote Fictif.
- **Switch.** Run `$C symptom log --child Lucas ...`, which selects Lucas through the combobox first. Alternatively, run `$C goto /dashboard` and check `$C snapshot --selector body` for `combobox "Enfant suivi": 👦 Lucas 6-8 ans`.

## Gotchas

- The combobox is named "Enfant suivi" (`click --role combobox --name "^Enfant suivi$"`). `selectChild` finds it by that name in `[data-slot="sidebar"]`, then waits for the portal listbox.
- Adding a child makes it the active child.
- The first dashboard load after sign-in logs a Base UI warning ("changing the uncontrolled value state of Select to be controlled"). It comes from the sidebar selector: its `value` is `undefined` until the active child loads (`child-selector.tsx`). Picking the age range in the dialog does not log it. It is harmless, but it is a real React warning.
- Never type a real child's name, not even on this throwaway instance.
