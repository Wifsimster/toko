// Consent document versions. Each constant is bumped whenever the wording of
// the corresponding document or attestation changes, so a consent row always
// pins the exact text the user agreed to (business rule F4). Opaque strings —
// the schema treats them as free-form identifiers.

// Terms of service / CGU (page: /mentions-legales).
export const TERMS_VERSION = "2026-07-13";
// Privacy policy (page: /confidentialite).
export const PRIVACY_VERSION = "2026-07-13";
// Owner attests they hold parental authority over the child they create
// (Art. 371-1 C. civ.).
export const OWNER_PARENTAL_AUTHORITY_VERSION = "2026-07-13";
// Owner's explicit Art. 9(2)(a) RGPD consent to process their child's health
// data, captured at child-profile creation.
export const OWNER_HEALTH_VERSION = "2026-07-13";
