import { eq } from "drizzle-orm";
import { db, children, user as userTable } from "@focusflow/db";
import { sendEmail } from "../email";
import { buildAcceptanceEmail } from "../co-parent-emails";
import { log } from "../safe-logger";
import { appOrigin } from "./tokens";

/**
 * Tells the inviter that someone accepted. Deliberately outside the accept
 * route: the co-parent is already on the child by the time this runs, so a
 * courtesy email failing must never fail their request.
 */

export async function notifyInviterOfAcceptance({
  inviterId,
  childId,
  acceptorName,
  acceptorEmail,
}: {
  inviterId: string;
  childId: string;
  acceptorName: string | null;
  acceptorEmail: string;
}): Promise<void> {
  try {
    const [row] = await db
      .select({
        inviterEmail: userTable.email,
        inviterName: userTable.name,
        childName: children.name,
      })
      .from(userTable)
      .innerJoin(children, eq(children.id, childId))
      .where(eq(userTable.id, inviterId))
      .limit(1);
    if (!row?.inviterEmail) return;

    const acceptorLabel = acceptorName?.trim() || acceptorEmail;
    await sendEmail({
      to: row.inviterEmail,
      subject: `${acceptorLabel} a rejoint le carnet de ${row.childName}`,
      html: buildAcceptanceEmail({
        inviterName: row.inviterName ?? "",
        acceptorLabel,
        childName: row.childName,
        appUrl: appOrigin(),
      }),
    });
  } catch (err) {
    // Best-effort: the co-parent is already on the child, and a failed
    // courtesy email must not fail their accept. Routed through the safe
    // logger so an address in the error never reaches the log (rule F5).
    log.error("co_parent_accept_notify_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
