import { randomBytes, createHash } from "node:crypto";
import { db } from "@focusflow/db";
import {
  user as userTable,
  children,
  childAccess,
  childInvitations,
} from "@focusflow/db";

export interface TestUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface CreateUserOpts {
  email?: string;
  name?: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
}

let userCounter = 0;

export async function createUser(opts: CreateUserOpts = {}): Promise<TestUser> {
  userCounter += 1;
  const id = crypto.randomUUID();
  const email = opts.email ?? `test-${userCounter}-${Date.now()}@toko.test`;
  const name = opts.name ?? `Test User ${userCounter}`;
  const emailVerified = opts.emailVerified ?? true;

  await db.insert(userTable).values({
    id,
    name,
    email,
    emailVerified,
    isAdmin: opts.isAdmin ?? false,
  });

  return { id, email, name, emailVerified };
}

export async function createChild(opts: {
  ownerId: string;
  name?: string;
}): Promise<{ id: string }> {
  // children.name is encrypted; we only need a string here. Drizzle's
  // $defaultFn populates the id, and ageRange is required by the schema
  // even if no test cares about it.
  const [row] = await db
    .insert(children)
    .values({
      name: opts.name ?? "Test Child",
      parentId: opts.ownerId,
      ageRange: "6-8",
    })
    .returning({ id: children.id });

  // Grant the owner role on child_access — every other domain check
  // reads this table, not children.parent_id.
  await db.insert(childAccess).values({
    childId: row!.id,
    userId: opts.ownerId,
    role: "owner",
  });

  return { id: row!.id };
}

export function makeRawToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPendingInvite(opts: {
  childId: string;
  invitedBy: string;
  invitedEmail: string;
  expiresInDays?: number;
}): Promise<{ token: string; id: string }> {
  const token = makeRawToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + (opts.expiresInDays ?? 14) * 24 * 60 * 60_000,
  );

  const [row] = await db
    .insert(childInvitations)
    .values({
      childId: opts.childId,
      invitedBy: opts.invitedBy,
      invitedEmail: opts.invitedEmail.toLowerCase(),
      tokenHash,
      expiresAt,
    })
    .returning({ id: childInvitations.id });

  return { token, id: row!.id };
}
