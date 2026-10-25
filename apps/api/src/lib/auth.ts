import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { expo } from "@better-auth/expo";
import { eq } from "drizzle-orm";
import { db, user, consents } from "@focusflow/db";
import { env } from "./env";
import { sendEmail } from "./email";
import { TERMS_VERSION, PRIVACY_VERSION } from "./consent-versions";
import {
  accountExistsEmail,
  resetPasswordEmail,
  verificationEmail,
  verificationReminderEmail,
} from "./email-templates";

// Header set by the verification-reminder job (jobs/email-jobs.ts) when it
// re-triggers a verification email. Its presence switches the template
// from the welcome confirmation to the corresponding "relance" step, so a
// scheduled nudge reads differently from the original sign-up mail.
export const REMINDER_STEP_HEADER = "x-toko-verify-reminder-step";

const devWebOrigins = ["http://localhost:5173", "http://localhost:5176"] as const

// Deep-link schemes for the Expo Android client (apps/mobile). The native app
// has no browser Origin, so Better Auth validates these schemes against
// trustedOrigins on state-changing auth requests. `toko://` is the production
// scheme (app.json → expo.scheme); `exp://` covers Expo Go during dev. Adding
// them is purely additive and does not affect web auth.
const mobileAppOrigins = ["toko://", "exp://"] as const

export const auth = betterAuth({
  // Surfaced as the TOTP issuer label in authenticator apps ("Tokō:
  // parent@example.com" in Google Authenticator / Authy / 1Password).
  appName: "Tokō",
  database: drizzleAdapter(db, { provider: "pg" }),
  // Requêtes via proxy Vite : Origin = frontend (5173/5176), pas l’API (3001)
  // APP_URL est inclus explicitement : les e-mails (reset, vérification)
  // redirigent vers cette origine, qui doit donc être de confiance même si
  // elle diffère légèrement de CORS_ORIGIN.
  // Les origines localhost ne sont de confiance qu'en dev/test : en
  // production elles ouvriraient la porte à des requêtes cross-site depuis
  // n'importe quel serveur local de la machine du visiteur.
  trustedOrigins: [
    ...(env.NODE_ENV !== "production" ? devWebOrigins : []),
    ...mobileAppOrigins,
    ...(env.CORS_ORIGIN ? [env.CORS_ORIGIN] : []),
    ...(env.APP_URL ? [env.APP_URL] : []),
  ],
  user: {
    additionalFields: {
      // Surfaced on the session so the client can show an "Admin" badge.
      // input: false — admin elevation is never user-provided at signup.
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // Enforced server-side on sign-up and password reset — the SPA's
    // minLength={8} is only a client hint and is trivially bypassed.
    minPasswordLength: 8,
    // A password reset is an account-recovery action: revoke every other
    // session so a stale or attacker-held session can't outlive the reset.
    revokeSessionsOnPasswordReset: true,
    // Better Auth appends ?token=... and uses this URL as the redirect target
    // emailed to the user. Pointed at the SPA route so the reset form opens
    // directly without a server round-trip.
    resetPasswordTokenExpiresIn: 60 * 60, // 1h
    sendResetPassword: async ({ user, token }) => {
      // Email link must hit the SPA, not the API host (Better Auth baseURL).
      const resetUrl = new URL("/reset-password", env.APP_URL);
      resetUrl.searchParams.set("token", token);
      const { subject, html } = resetPasswordEmail({ url: resetUrl.toString() });
      await sendEmail({ to: user.email, subject, html });
    },
    // Account-enumeration guard. With this flag Better Auth answers a
    // sign-up for an address that already has an account exactly like a new
    // sign-up (200, synthetic user, no session) instead of
    // 422 USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL. The flip side: no session at
    // sign-up, and email/password sign-in is refused (403 EMAIL_NOT_VERIFIED,
    // only after a correct password) until the address is confirmed.
    // Accounts that existed before this flag shipped were marked verified by
    // migration 0064 so nobody already signed up gets locked out.
    requireEmailVerification: true,
    // The fake user Better Auth returns for an existing address must match
    // a real sign-up field for field, in the same key order (a client can
    // see the JSON order). A real user comes out as core fields, then the
    // twoFactor plugin field, then our additionalFields, then id; the
    // default synthetic user would put twoFactorEnabled after isAdmin.
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      twoFactorEnabled: false,
      ...additionalFields,
      id,
    }),
    // The real owner of an existing address still needs to hear something,
    // otherwise they wait for a mail that never comes. Unverified owner: a
    // fresh verification link. Verified owner: "vous avez déjà un compte".
    // One email in both branches, like a new sign-up, so the response time
    // does not give the answer away either.
    onExistingUserSignUp: async ({ user: existing }) => {
      try {
        if (!existing.emailVerified) {
          await auth.api.sendVerificationEmail({
            body: { email: existing.email, callbackURL: "/dashboard" },
          });
          return;
        }
        const { subject, html } = accountExistsEmail({
          name: existing.name ?? "",
          loginUrl: new URL("/login", env.APP_URL).toString(),
        });
        await sendEmail({ to: existing.email, subject, html });
      } catch (err) {
        console.error("existing_user_signup_email_failed", err);
      }
    },
  },
  // Every email/password account must confirm its address before its first
  // sign-in (requireEmailVerification above). Co-parent invitations also
  // check the verified flag (see child-invitations route).
  emailVerification: {
    // Send the confirmation email on every email/password sign-up.
    sendOnSignUp: true,
    // 24h instead of Better Auth's 1h default: a parent may open the mail
    // the next evening. The reminder job sends fresh links after that.
    expiresIn: 60 * 60 * 24,
    // After clicking the link the parent is signed in straight away and
    // lands on the dashboard, where the Mō onboarding opens — no second
    // login. Works for a sign-up started in the mobile app too: the link
    // opens the web app, the app itself still asks for a sign-in.
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      // Better Auth's `url` targets the API verify-email endpoint and carries
      // a `callbackURL` for the post-verification redirect. Rewrite that
      // callback to an absolute SPA URL: a resend triggered from the
      // invitation page returns the user straight there, anything else
      // (e.g. a plain sign-up) lands on the dashboard.
      let verifyUrl = url;
      try {
        const parsed = new URL(url);
        const requested = parsed.searchParams.get("callbackURL") ?? "";
        const landing = requested.startsWith("/invite/")
          ? requested
          : "/dashboard";
        parsed.searchParams.set(
          "callbackURL",
          new URL(landing, env.APP_URL).toString(),
        );
        verifyUrl = parsed.toString();
      } catch {
        // Fall back to Better Auth's original URL if it can't be parsed.
      }
      // A reminder step in the request headers means this send was queued
      // by the verification-reminder job — use the matching "relance"
      // template instead of the first-time welcome confirmation.
      const reminderStep = Number(
        request?.headers?.get(REMINDER_STEP_HEADER) ?? "",
      );
      const { subject, html } =
        reminderStep === 1 || reminderStep === 2 || reminderStep === 3
          ? verificationReminderEmail({
              name: user.name ?? "",
              url: verifyUrl,
              step: reminderStep,
            })
          : verificationEmail({
              name: user.name ?? "",
              url: verifyUrl,
            });
      // A transient email failure must never abort the sign-up itself — the
      // parent can resend from the "Vérifiez votre boîte mail" screen or
      // the sign-in page.
      try {
        await sendEmail({ to: user.email, subject, html });
      } catch (err) {
        console.error("verification_email_send_failed", err);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/*": { window: 60, max: 10 },
      "/sign-up/*": { window: 60, max: 10 },
      // Reset-request endpoint. The route is `/request-password-reset` in
      // Better Auth 1.5 (the old `/forget-password` key matched nothing and
      // left this on the default 100/min — a free email-spam amplifier).
      "/request-password-reset": { window: 60, max: 5 },
      // Token-submission endpoint — without this it falls back to the
      // default 100/min, leaving the reset token open to rapid guessing.
      "/reset-password": { window: 60, max: 10 },
      // Verification-email (re)send — same email-spam amplifier risk as the
      // reset-request endpoint, so cap it just as tightly.
      "/send-verification-email": { window: 60, max: 5 },
    },
  },
  plugins: [
    // Native Android client support (apps/mobile). Enables the Expo client to
    // store the session cookie in expo-secure-store and replay it via headers,
    // and handles the app's deep-link scheme for OAuth redirects. Additive —
    // web auth (cookies, 2FA, passkeys) is unchanged.
    expo(),
    // TOTP-based second factor. Backup codes are auto-generated on enroll
    // and surfaced once — the SPA must show them, the parent must save
    // them. `issuer` falls back to `appName` above; setting it explicitly
    // here documents intent.
    twoFactor({ issuer: "Tokō" }),
    // WebAuthn — Touch ID, Face ID, Windows Hello, hardware security
    // keys. rpID is the cookie-style domain; origin is the full URL the
    // SPA is served from. Both must match the browser's origin exactly or
    // the assertion fails with `NotAllowedError`.
    passkey({
      rpID: env.PASSKEY_RP_ID,
      rpName: env.PASSKEY_RP_NAME,
      origin: env.PASSKEY_ORIGIN,
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        // Record consent to the terms of service and privacy policy at account
        // creation (business rule F4 / RGPD). The sign-up UI requires the user
        // to accept both before submitting (email form: a required checkbox;
        // OAuth: an explicit notice), so every new account carries the proof.
        // Fires for both email and Google sign-up.
        after: async (createdUser) => {
          await db.insert(consents).values([
            { userId: createdUser.id, type: "terms", version: TERMS_VERSION },
            { userId: createdUser.id, type: "privacy", version: PRIVACY_VERSION },
          ]);
        },
      },
    },
    session: {
      create: {
        // A blocked user must never obtain a new session — this rejects
        // sign-in (email and OAuth) before the session row is written.
        // Existing sessions are revoked separately when the admin blocks
        // the account.
        before: async (session) => {
          const [row] = await db
            .select({ isBlocked: user.isBlocked })
            .from(user)
            .where(eq(user.id, session.userId))
            .limit(1);
          if (row?.isBlocked) {
            throw new APIError("FORBIDDEN", {
              message: "Ce compte a été bloqué. Contactez un administrateur.",
            });
          }
          return { data: session };
        },
      },
    },
  },
});
