import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@focusflow/db";
import { env } from "./env";

const devWebOrigins = ["http://localhost:5173", "http://localhost:5176"] as const

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  // Requêtes via proxy Vite : Origin = frontend (5173/5176), pas l’API (3001)
  trustedOrigins: [
    ...devWebOrigins,
    ...(env.CORS_ORIGIN ? [env.CORS_ORIGIN] : []),
  ],
  emailAndPassword: {
    enabled: true,
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
});
