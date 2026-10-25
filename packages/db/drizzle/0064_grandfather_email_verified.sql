-- One-time grandfathering for requireEmailVerification (apps/api/src/lib/auth.ts).
-- From this release, email/password sign-in is refused until the address is
-- confirmed. Every account created under the old rules already has access:
-- mark it verified so no parent who already signed up is locked out. Google
-- accounts are already verified (Better Auth trusts Google's email_verified).
--
-- Two bounds:
-- 1. Run time: migrations run at API startup, before the new auth config
--    serves its first request, and Drizzle records this one in
--    __drizzle_migrations so a redeploy never runs it again.
-- 2. Creation date: only accounts created before 2026-10-25 19:00, a moment
--    before this change could be merged and deployed. A manual replay after
--    the deploy therefore never verifies an account created under the new
--    rules. The column is `timestamp` without time zone (UTC from Better Auth,
--    Europe/Paris for the DB default); either way the cutoff is before the
--    merge. An account created between the cutoff and the deploy is not
--    grandfathered: it got the confirmation email at sign-up (sendOnSignUp
--    was already on) and can resend it from the sign-in page.
--
-- Idempotent: a second run changes nothing. updated_at is left alone on
-- purpose: the parent changed nothing.
UPDATE "user"
SET "email_verified" = true
WHERE "email_verified" = false
  AND "created_at" < timestamp '2026-10-25 19:00:00';
