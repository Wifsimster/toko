import { db, user, account, subscription } from "@focusflow/db";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const DEMO_USER = {
  email: "demo@toko.app",
  password: "demo1234",
  name: "Parent Démo",
};

export async function seedDemoUser() {
  console.log("🌱 Seeding demo user...");

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, DEMO_USER.email))
    .limit(1);

  if (existing.length > 0) {
    console.log("✅ Demo user already exists, skipping.");
    return;
  }

  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const subscriptionId = crypto.randomUUID();

  // Create user
  await db.insert(user).values({
    id: userId,
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    emailVerified: true,
  });

  // Create credential account with better-auth compatible password hash
  const hashedPwd = await hashPassword(DEMO_USER.password);
  await db.insert(account).values({
    id: accountId,
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashedPwd,
  });

  // Create active premium subscription (demo — no real Stripe IDs)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  await db.insert(subscription).values({
    id: subscriptionId,
    userId,
    stripeCustomerId: "demo_customer",
    stripeSubscriptionId: "demo_subscription",
    status: "active",
    planId: "famille_premium",
    currentPeriodEnd: oneYearFromNow,
  });

  console.log("✅ Demo user created:");
  console.log(`   Email:    ${DEMO_USER.email}`);
  console.log(`   Password: ${DEMO_USER.password}`);
  console.log(
    `   Plan:     Famille (Premium) — active until ${oneYearFromNow.toLocaleDateString("fr-FR")}`
  );
}

// Run as standalone script
const isMainModule =
  process.argv[1] &&
  (process.argv[1].endsWith("/seed.ts") || process.argv[1].endsWith("/seed.js"));

if (isMainModule) {
  seedDemoUser()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
