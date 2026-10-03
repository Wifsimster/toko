# Consultation report

`/report` ("Carnet de consultation TDAH") builds a document for the child's doctor. It covers a chosen period (7, 30 or 90 days, or custom) and holds:

- KPIs: entries, days tracked, crises, victories
- averages per dimension, with trend
- journal highlights
- "Vos questions au médecin"

The document can be downloaded as PDF (`/api/report/pdf`) or e-mailed to the doctor. "Rapport consolidé" merges several children.

## Sub-features

- `report-preview`: the on-page document for the active child.
- `report-period`: the period picker. The default is 90 jours.
- `report-questions`: a textarea saved in `localStorage` per child, printed in the PDF header.
- `report-pdf`: "Télécharger en PDF". Not scripted.
- `report-email`: "Envoyer par email au médecin". It needs Resend, which is empty here, so the send is a no-op. Not scripted.

## How to get to it (user POV)

- The sidebar "Rapport".

## Driving it with control-toko

Preconditions:

- `$C login` succeeded.
- The data from `symptoms.md` and `journal.md` was entered for "Pilote Fictif" today.

- **Preview reflects the data.** Run `$C goto /report`, then `$C screenshot --name report --full-page`.
  - The `h1` is "Carnet de consultation TDAH", and the document header names "Pilote Fictif · 9–11 ans".
  - The KPIs read `1 Entrées journal`, `1 Jours suivis`, `1 Victoires notées`.
  - The averages read `Agitation 8.0`, `Concentration 3.0`, `Impulsivité 8.0`, `Humeur 3.0`, `Sommeil 4.0`.
  - The journal highlight shows the entry with the Victoire and École tags.

## Gotchas

- The upsell card and premium gating depend on `subscription` and billing status. The demo parent has an active subscription row, so the full report shows.
