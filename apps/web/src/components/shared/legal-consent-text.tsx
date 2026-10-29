import { Trans } from "react-i18next";

export function LegalConsentText({ i18nKey }: { i18nKey: string }) {
  return (
    <Trans
      i18nKey={i18nKey}
      components={{
        terms: (
          <a
            href="/cgu"
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
