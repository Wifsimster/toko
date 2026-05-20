import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { eq } from "drizzle-orm";
import { db, user } from "@focusflow/db";
import { env } from "./env";
import { sendEmail } from "./email";
import { resetPasswordEmail, verificationEmail } from "./email-templates";

const devWebOrigins = ["http://localhost:5173", "http://localhost:5176"] as const

export const auth = betterAuth({
  // Surfaced as the TOTP issuer label in authenticator apps ("Tokō:
  // parent@example.com" in Google Authenticator / Authy / 1Password).
  appName: "Tokō",
  database: drizzleAdapter(db, { provider: "pg" }),
  // Requêtes via proxy Vite : Origin = frontend (5173/5176), pas l’API (3001)
  // APP_URL est inclus explicitement : les e-mails (reset, vérification)
  // redirigent vers cette origine, qui doit donc être de confiance même si
  // elle diffère légèrement de CORS_ORIGIN.
  trustedOrigins: [
    ...devWebOrigins,
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
  },
  // Co-parent invitations can only be accepted once the invitee's address is
  // verified (see child-invitations route). Without this block Better Auth
  // never sends a verification email, so an email/password co-parent was
  // permanently stuck on "vérifiez votre e-mail" with no email to act on.
  emailVerification: {
    // Send the confirmation email on every email/password sign-up so a
    // freshly registered co-parent can clear the accept gate without an
    // extra manual step.
    sendOnSignUp: true,
    // After clicking the link the invitee is signed in straight away — no
    // second login before they return to the invitation page.
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
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
      const { subject, html } = verificationEmail({
        name: user.name ?? "",
        url: verifyUrl,
      });
      // A transient email failure must never abort the sign-up itself — the
      // user can resend from the invitation page.
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
