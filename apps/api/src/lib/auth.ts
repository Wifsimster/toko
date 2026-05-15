import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { db, user } from "@focusflow/db";
import { env } from "./env";
import { sendEmail } from "./email";
import { resetPasswordEmail } from "./email-templates";

const devWebOrigins = ["http://localhost:5173", "http://localhost:5176"] as const

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  // Requêtes via proxy Vite : Origin = frontend (5173/5176), pas l’API (3001)
  trustedOrigins: [
    ...devWebOrigins,
    ...(env.CORS_ORIGIN ? [env.CORS_ORIGIN] : []),
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
      "/forget-password": { window: 60, max: 5 },
    },
  },
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
