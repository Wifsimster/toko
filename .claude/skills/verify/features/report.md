# Consultation report

`/report` ("Carnet de consultation TDAH") builds a document for the child's doctor. It covers a chosen period (7, 30 or 90 days, or custom) and holds:

- KPIs: entries, days tracked, crises, victories
- averages per dimension, with trend
- journal highlights
- the parent's questions (typed in "Vos questions au médecin", shown under "Questions du parent")

A paying parent downloads the PDF from `/api/report/pdf` or e-mails it to the doctor. A free parent's PDF button is the browser's print. "Rapport consolidé" merges several children.

## Sub-features

- `report-preview`: the on-page document for the active child.
- `report-period`: the period picker (tabs "7 jours", "30 jours", "90 jours", "Personnalisé"). The default is "90 jours" for a parent with an active subscription, such as the demo parent. A free-tier parent starts on "30 jours".
- `report-questions`: a textarea saved in `localStorage` per child, printed in the PDF header.
- `report-pdf`: "Télécharger en PDF". For the demo parent it POSTs `/api/report/pdf` (200); any failure falls back to `window.print()`.
- `report-email`: "Envoyer par email au médecin" (paying parents). It POSTs `/api/report/send-email` (200, `sent: true`, 10 per hour per parent). The harness outbox catches the mail, so `$C mail` shows it.

## How to get to it (user POV)

- The sidebar "Rapport".

## Driving it with control-toko

Preconditions:

- `$C login` succeeded.
- The data from `symptoms.md` and `journal.md` was entered for "Pilote Fictif" today.

- **Preview reflects the data.** Run `$C goto /report`, then `$C screenshot --name report --full-page`.
  - The `h1` is "Carnet de consultation TDAH". In the document, the `h2` is "Pilote Fictif", followed by the line "· 9-11 ans" (a plain hyphen).
  - The KPIs read `1 Entrées journal`, `1 Jours suivis`, `0 Crises notées`, `1 Victoires notées`. "Entrées journal" counts the highlights, which stop at 10.
  - The averages table lists `Humeur 3.0`, `Concentration 3.0`, `Agitation 8.0`, `Impulsivité 8.0`, `Sommeil 4.0`, in that order.
  - The journal highlight shows the entry with the Victoire and École tags.
- **E-mail to the doctor.** `$C fill --label "^Vos questions au médecin$" --value "Question synthétique"`: the document shows it under "Questions du parent". Then `$C fill --label "^Envoyer par email au médecin$" --value "docteur@toko-verify.test"` and `$C click --role button --name "^Envoyer$"`: `POST /api/report/send-email` 200. `$C mail --to docteur@toko-verify.test --last` shows "Rapport TDAH — Pilote Fictif (<start> → <end>)".
- **PDF.** `$C click --role button --name "PDF" --within main` prints `POST /api/report/pdf` 200.

## Gotchas

- The upsell card and premium gating depend on `subscription` and billing status. The demo parent has an active subscription row, so the full report shows.
