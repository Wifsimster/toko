import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { expo } from "@better-auth/expo";
import { eq } from "drizzle-orm";
import { db, user, consents } from "@focusflow/db";
import { env } from "./env";
import { sendEmail, type EmailPayload } from "./email";
import { TERMS_VERSION, PRIVACY_VERSION } from "./consent-versions";
import { secureAccountAfterPasswordReset } from "./account-recovery";
import { discardPasskeyFromRevokedSession } from "./live-session";
import {
  accountExistsEmail,
  finishAccountEmail,
  resetPasswordEmail,
  verificationEmail,
  verificationReminderEmail,
} from "./email-templates";

export const REMINDER_STEP_HEADER = "x-toko-verify-reminder-step";

function sendInBackground(payload: EmailPayload, tag: string): void {
  void sendEmail(payload).then(
    (result) => {
      if (!result.sent && result.reason === "error") console.error(tag, result.detail);
    },
    (err: unknown) => console.error(tag, err),
  );
}

const devWebOrigins = ["http://localhost:5173", "http://localhost:5176"] as const

const mobileAppOrigins = ["toko://", "exp://"] as const

export const auth = betterAuth({
  appName: "Tokō",
  database: drizzleAdapter(db, { provider: "pg" }),
  trustedOrigins: [
    ...(env.NODE_ENV !== "production" ? devWebOrigins : []),
    ...mobileAppOrigins,
    ...(env.CORS_ORIGIN ? [env.CORS_ORIGIN] : []),
    ...(env.APP_URL ? [env.APP_URL] : []),
  ],
  user: {
    additionalFields: {
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
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: ({ user, token }) => {
      const resetUrl = new URL("/reset-password", env.APP_URL);
      resetUrl.searchParams.set("token", token);
      const { subject, html } = user.emailVerified
        ? resetPasswordEmail({ url: resetUrl.toString() })
        : finishAccountEmail({ url: resetUrl.toString() });
      sendInBackground({ to: user.email, subject, html }, "reset_password_email_failed");
      return Promise.resolve();
    },
    onPasswordReset: async ({ user: resetUser }) => {
      await secureAccountAfterPasswordReset(resetUser.id, {
        wasEmailVerified: resetUser.emailVerified,
      });
    },
    requireEmailVerification: true,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      twoFactorEnabled: false,
      ...additionalFields,
      id,
    }),
    onExistingUserSignUp: async ({ user: existing }) => {
      try {
        if (!existing.emailVerified) {
          await auth.api.requestPasswordReset({
            body: { email: existing.email, redirectTo: "/reset-password" },
          });
          return;
        }
        const { subject, html } = accountExistsEmail({
          loginUrl: new URL("/login", env.APP_URL).toString(),
        });
        sendInBackground({ to: existing.email, subject, html }, "existing_user_signup_email_failed");
      } catch (err) {
        console.error("existing_user_signup_email_failed", err);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60 * 24,
    autoSignInAfterVerification: false,
    sendVerificationEmail: ({ user, url }, request) => {
      let verifyUrl = url;
      try {
        const parsed = new URL(url);
        const requested = parsed.searchParams.get("callbackURL") ?? "";
        const landing = requested.startsWith("/invite/")
          ? requested
          : "/login?verified=1";
        parsed.searchParams.set(
          "callbackURL",
          new URL(landing, env.APP_URL).toString(),
        );
        verifyUrl = parsed.toString();
      } catch {
      }
      const reminderStep = Number(
        request?.headers?.get(REMINDER_STEP_HEADER) ?? "",
      );
      const { subject, html } =
        reminderStep === 1 || reminderStep === 2 || reminderStep === 3
          ? verificationReminderEmail({
              url: verifyUrl,
              step: reminderStep,
            })
          : verificationEmail({
              url: verifyUrl,
            });
      sendInBackground({ to: user.email, subject, html }, "verification_email_send_failed");
      return Promise.resolve();
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    cookieCache: {
      enabled: false,
    },
  },
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/*": { window: 60, max: 10 },
      "/sign-up/*": { window: 60, max: 10 },
      "/request-password-reset": { window: 60, max: 5 },
      "/reset-password": { window: 60, max: 10 },
      "/send-verification-email": { window: 60, max: 5 },
    },
  },
  plugins: [
    expo(),
    twoFactor({ issuer: "Tokō" }),
    passkey({
      rpID: env.PASSKEY_RP_ID,
      rpName: env.PASSKEY_RP_NAME,
      origin: env.PASSKEY_ORIGIN,
    }),
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/passkey/verify-registration") return;
      const created = ctx.context.returned as { id?: string; userId?: string } | undefined;
      if (!created || created instanceof Error || !created.id || !created.userId) return;
      const sessionToken = await ctx.getSignedCookie(
        ctx.context.authCookies.sessionToken.name,
        ctx.context.secret,
      );
      const discarded = await discardPasskeyFromRevokedSession({
        sessionId: ctx.context.session?.session.id ?? null,
        sessionToken: sessionToken || null,
        passkeyId: created.id,
        userId: created.userId,
      });
      if (discarded) {
        throw new APIError("UNAUTHORIZED", {
          message: "Session expirée. Reconnectez-vous.",
        });
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
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
