import { eq } from "drizzle-orm";
import { db, children, user as userTable } from "@focusflow/db";
import { sendEmail } from "../email";
import { buildAcceptanceEmail } from "../co-parent-emails";
import { log } from "../safe-logger";
import { appOrigin } from "./tokens";

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
    log.error("co_parent_accept_notify_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
