import { Trans } from "react-i18next";

// Renders a translated consent sentence whose <terms> and <privacy> tags are
// turned into links to the legal notice and privacy policy. Shared by the
// registration form and the auth page so the legal URLs and link styling live
// in one place. The i18n string must use the <terms> and <privacy> tags, e.g.
// "J'accepte les <terms>conditions</terms> et la <privacy>confidentialité</privacy>."
export function LegalConsentText({ i18nKey }: { i18nKey: string }) {
  return (
    <Trans
      i18nKey={i18nKey}
      components={{
        terms: (
          <a
            href="/mentions-legales"
            target="_blank"
            rel="noreferrer noopener"
            className="underline hover:text-foreground"
          />
        ),
        privacy: (
          <a
            href="/confidentialite"
            target="_blank"
            rel="noreferrer noopener"
            className="underline hover:text-foreground"
          />
        ),
      }}
    />
  );
}
