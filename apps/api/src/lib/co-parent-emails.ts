// Email HTML for the co-parent invitation lifecycle. Kept in a dedicated
// module so the templates are unit-testable and so future copy changes can
// happen without touching the route handler.

interface InviteEmailParams {
  inviterName: string;
  childName: string;
  acceptUrl: string;
  expiresAt: Date;
}

interface BulkInviteEmailParams {
  inviterName: string;
  childrenNames: string[];
  acceptUrl: string;
  expiresAt: Date;
}

interface AcceptanceEmailParams {
  inviterName: string;
  acceptorLabel: string;
  childName: string;
  appUrl: string;
}

export function buildInviteEmail({
  inviterName,
  childName,
  acceptUrl,
  expiresAt,
}: InviteEmailParams): string {
  const expiryFr = expiresAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const safeInviter = escapeHtml(inviterName);
  const safeChild = escapeHtml(childName);
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Invitation Tokō</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
  <div style="border-bottom:2px solid #6366f1;padding-bottom:16px;margin-bottom:24px">
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#6366f1;margin:0">Tokō · invitation</p>
    <h1 style="font-size:22px;margin:8px 0 4px">${safeInviter} aimerait partager avec vous le carnet de ${safeChild}</h1>
  </div>
  <p style="font-size:15px;line-height:1.6">
    Tokō est un carnet de consultation TDAH partagé. En acceptant cette invitation, vous accédez aux mêmes informations que ${safeInviter} pour ${safeChild} : symptômes, journal, traitement, programme Barkley.
  </p>
  <p style="text-align:center;margin:24px 0">
    <a href="${acceptUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Accepter l'invitation</a>
  </p>
  <p style="font-size:13px;color:#6b7280">
    Ou collez ce lien dans votre navigateur :<br>
    <a href="${acceptUrl}" style="color:#6366f1;word-break:break-all">${acceptUrl}</a>
  </p>
  <p style="font-size:12px;color:#9ca3af;margin-top:24px">
    L'invitation expire le ${expiryFr}. Si vous n'attendiez pas cet email, ignorez-le — aucun compte n'est créé sans votre action.
  </p>
</body></html>`;
}

export function buildBulkInviteEmail({
  inviterName,
  childrenNames,
  acceptUrl,
  expiresAt,
}: BulkInviteEmailParams): string {
  const expiryFr = expiresAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const safeInviter = escapeHtml(inviterName);
  const safeChildren = childrenNames.map(escapeHtml);
  const childList = safeChildren
    .map((n) => `<li style="margin:4px 0">${n}</li>`)
    .join("");
  const headline =
    childrenNames.length === 1
      ? `${safeInviter} aimerait partager avec vous le carnet de ${safeChildren[0]}`
      : `${safeInviter} aimerait partager avec vous ${childrenNames.length} carnets`;
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Invitation Tokō</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
  <div style="border-bottom:2px solid #6366f1;padding-bottom:16px;margin-bottom:24px">
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#6366f1;margin:0">Tokō · invitation</p>
    <h1 style="font-size:22px;margin:8px 0 4px">${headline}</h1>
  </div>
  <p style="font-size:15px;line-height:1.6">
    Tokō est un carnet de consultation TDAH partagé. En acceptant cette invitation, vous accédez aux mêmes informations que ${safeInviter} pour :
  </p>
  <ul style="font-size:15px;line-height:1.6;padding-left:24px">${childList}</ul>
  <p style="text-align:center;margin:24px 0">
    <a href="${acceptUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Accepter l'invitation</a>
  </p>
  <p style="font-size:13px;color:#6b7280">
    Ou collez ce lien dans votre navigateur :<br>
    <a href="${acceptUrl}" style="color:#6366f1;word-break:break-all">${acceptUrl}</a>
  </p>
  <p style="font-size:12px;color:#9ca3af;margin-top:24px">
    L'invitation expire le ${expiryFr}. Si vous n'attendiez pas cet email, ignorez-le — aucun compte n'est créé sans votre action.
  </p>
</body></html>`;
}

export function buildAcceptanceEmail({
  inviterName,
  acceptorLabel,
  childName,
  appUrl,
}: AcceptanceEmailParams): string {
  const safeInviter = escapeHtml(inviterName || "Bonjour");
  const safeAcceptor = escapeHtml(acceptorLabel);
  const safeChild = escapeHtml(childName);
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><title>Invitation acceptée</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
  <div style="border-bottom:2px solid #16a34a;padding-bottom:16px;margin-bottom:24px">
    <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#16a34a;margin:0">Tokō · invitation acceptée</p>
    <h1 style="font-size:22px;margin:8px 0 4px">${safeAcceptor} a rejoint le carnet de ${safeChild}</h1>
  </div>
  <p style="font-size:15px;line-height:1.6">
    ${safeInviter}, votre invitation a été acceptée. ${safeAcceptor} dispose maintenant des mêmes accès que vous pour ${safeChild} : symptômes, journal, traitement, programme Barkley, rendez-vous.
  </p>
  <p style="text-align:center;margin:24px 0">
    <a href="${appUrl}/dashboard" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Ouvrir Tokō</a>
  </p>
  <p style="font-size:12px;color:#9ca3af;margin-top:24px">
    Vous restez la personne qui gère l'abonnement et qui peut retirer l'accès à tout moment depuis les paramètres de l'enfant.
  </p>
</body></html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
