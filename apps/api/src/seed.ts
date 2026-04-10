import {
  db,
  user,
  account,
  subscription,
  children,
  symptoms,
  journalEntries,
  barkleySteps,
  barkleyBehaviors,
  barkleyRewards,
  barkleyBehaviorLogs,
  crisisItems,
  news,
} from "@focusflow/db";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Deterministic IDs — ensures idempotence and FK integrity across re-runs
// ---------------------------------------------------------------------------
const DEMO_USER_ID = "00000000-0000-4000-a000-demo00000001";
const DEMO_ACCOUNT_ID = "00000000-0000-4000-a000-demo00000002";
const DEMO_SUBSCRIPTION_ID = "00000000-0000-4000-a000-demo00000003";
const DEMO_CHILD_1_ID = "00000000-0000-4000-a000-child0000001"; // Lucas
const DEMO_CHILD_2_ID = "00000000-0000-4000-a000-child0000002"; // Emma

// Barkley behavior IDs (needed for FK in logs)
const BEHAVIOR_1_ID = "00000000-0000-4000-a000-behav0000001";
const BEHAVIOR_2_ID = "00000000-0000-4000-a000-behav0000002";
const BEHAVIOR_3_ID = "00000000-0000-4000-a000-behav0000003";
const BEHAVIOR_4_ID = "00000000-0000-4000-a000-behav0000004";

const DEMO_USER = {
  email: "demo@toko.app",
  password: "demo1234",
  name: "Parent Démo",
};

// ---------------------------------------------------------------------------
// Date helpers — all dates relative to now for fresh demo data
// ---------------------------------------------------------------------------
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0]!;
}

function daysAgoDate(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function getMondayOfWeek(weeksAgo = 0): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) - weeksAgo * 7;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekDay(monday: Date, offset: number): string {
  const d = new Date(monday);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0]!;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

// ---------------------------------------------------------------------------
// Seed demo user
// ---------------------------------------------------------------------------
export async function seedDemoUser() {
  console.log("🌱 Seeding demo user...");

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, DEMO_USER.email))
    .limit(1);

  if (existing.length > 0) {
    console.log("✅ Demo user already exists, skipping user creation.");
    await seedDemoData(existing[0]!.id);
    return;
  }

  // Create user
  await db.insert(user).values({
    id: DEMO_USER_ID,
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    emailVerified: true,
    isAdmin: true,
  });

  // Create credential account
  const hashedPwd = await hashPassword(DEMO_USER.password);
  await db.insert(account).values({
    id: DEMO_ACCOUNT_ID,
    accountId: DEMO_USER_ID,
    providerId: "credential",
    userId: DEMO_USER_ID,
    password: hashedPwd,
  });

  // Create active premium subscription
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  await db.insert(subscription).values({
    id: DEMO_SUBSCRIPTION_ID,
    userId: DEMO_USER_ID,
    stripeCustomerId: "demo_customer",
    stripeSubscriptionId: "demo_subscription",
    status: "active",
    planId: "famille_premium",
    currentPeriodEnd: oneYearFromNow,
  });

  console.log("✅ Demo user created:");
  console.log(`   Email:    ${DEMO_USER.email}`);
  console.log(
    `   Plan:     Famille (Premium) — active until ${oneYearFromNow.toLocaleDateString("fr-FR")}`
  );

  await seedDemoData(DEMO_USER_ID);
}

// ---------------------------------------------------------------------------
// Seed demo feature data
// ---------------------------------------------------------------------------
async function seedDemoData(userId: string) {
  // Gate: if demo child already exists, skip all feature data
  const existingChildren = await db
    .select()
    .from(children)
    .where(eq(children.parentId, userId))
    .limit(1);

  if (existingChildren.length > 0) {
    console.log("✅ Demo data already exists, skipping.");
    return;
  }

  console.log("🌱 Seeding demo data...");

  // ── Children ──────────────────────────────────────────────────────────
  await db.insert(children).values([
    {
      id: DEMO_CHILD_1_ID,
      parentId: userId,
      name: "Lucas",
      birthDate: "2018-06-15",
      gender: "male",
      diagnosisType: "mixed",
    },
    {
      id: DEMO_CHILD_2_ID,
      parentId: userId,
      name: "Emma",
      birthDate: "2020-11-03",
      gender: "female",
      diagnosisType: "inattentive",
    },
  ]);
  console.log("   ✅ 2 enfants créés (Lucas, Emma)");

  // ── Symptoms for Lucas (21 days) ─────────────────────────────────────
  // Narrative arc: agitation↓, focus↑, mood↑ over 3 weeks
  const lucasSymptoms = [];
  for (let i = 20; i >= 0; i--) {
    const progress = 1 - i / 20; // 0→1 as we approach today
    lucasSymptoms.push({
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(i),
      agitation: clamp(8 - progress * 4 + Math.sin(i * 1.3) * 1.5, 0, 10),
      focus: clamp(3 + progress * 4 + Math.cos(i * 1.1) * 1, 0, 10),
      impulse: clamp(7 - progress * 3 + Math.sin(i * 0.9) * 1.5, 0, 10),
      mood: clamp(4 + progress * 3 + Math.cos(i * 1.5) * 1, 0, 10),
      sleep: clamp(6 + Math.sin(i * 0.7) * 1.5, 0, 10),
      routinesOk: i % 3 !== 0,
      context:
        i % 2 === 0
          ? ["Journée école", "Weekend maison", "Après le sport", "Sortie scolaire", "Matin calme"][i % 5]
          : null,
      notes:
        i % 3 === 0
          ? [
              "Grosse agitation après la récréation, difficile de se concentrer en classe.",
              "Bonne journée, devoirs faits sans conflit.",
              "Nuit agitée, cauchemars. Fatigué toute la matinée.",
              "Super progrès en lecture, la maîtresse est contente !",
              "Journée difficile, plusieurs crises. Séance de sport le soir a aidé.",
              "Calme et attentif, première fois qu'il finit un exercice seul.",
              "Conflit avec un camarade à la cantine, géré avec l'aide de la maîtresse.",
            ][i % 7]
          : null,
    });
  }
  await db.insert(symptoms).values(lucasSymptoms);

  // ── Symptoms for Emma (7 days) ───────────────────────────────────────
  const emmaSymptoms = [];
  for (let i = 6; i >= 0; i--) {
    emmaSymptoms.push({
      childId: DEMO_CHILD_2_ID,
      date: daysAgo(i),
      agitation: clamp(3 + Math.sin(i * 1.5) * 1.5, 0, 10),
      focus: clamp(4 + Math.cos(i * 1.2) * 2, 0, 10),
      impulse: clamp(3 + Math.sin(i * 0.8) * 1, 0, 10),
      mood: clamp(6 + Math.cos(i * 1.3) * 1.5, 0, 10),
      sleep: clamp(7 + Math.sin(i * 0.6) * 1, 0, 10),
      routinesOk: true,
      context: i % 2 === 0 ? "Journée crèche" : null,
      notes: i === 3 ? "Très concentrée sur son dessin aujourd'hui." : null,
    });
  }
  await db.insert(symptoms).values(emmaSymptoms);
  console.log("   ✅ Symptômes créés (21j Lucas + 7j Emma)");

  // ── Journal entries for Lucas (10 entries) ────────────────────────────
  await db.insert(journalEntries).values([
    {
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(0),
      text: "Lucas a passé une bonne journée à l'école. La maîtresse nous a dit qu'il a réussi à rester concentré pendant tout l'exercice de lecture. On est fiers de lui !",
      tags: ["school", "victory"],
    },
    {
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(2),
      text: "Journée compliquée. Appel de la maîtresse en fin de matinée : Lucas a eu une grosse crise après une frustration en récré. On a mis en place les exercices de respiration en rentrant.",
      tags: ["school", "crisis"],
    },
    {
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(4),
      text: "Super séance de judo ce soir ! Lucas était calme toute la soirée après. Le sport lui fait vraiment du bien.",
      tags: ["sport", "victory"],
    },
    {
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(6),
      text: "Nuit difficile, Lucas s'est réveillé deux fois avec des cauchemars. Matinée compliquée du coup, très fatigué.",
      tags: ["sleep"],
    },
    {
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(8),
      text: "Premier jour sans oublier son cartable ! On a fêté ça avec un petit goûter spécial. Les efforts sur la routine du soir commencent à payer.",
      tags: ["school", "victory"],
    },
    {
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(10),
      text: "Rendez-vous avec le pédopsychiatre. On a ajusté le traitement, légère augmentation de la dose du matin. À surveiller cette semaine.",
      tags: ["medication", "therapy"],
    },
    {
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(12),
      text: "Belle journée en famille. Promenade au parc, Lucas a joué avec d'autres enfants sans conflit. Soirée calme.",
      tags: ["sport", "victory"],
    },
    {
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(14),
      text: "Matin difficile, refus de se préparer pour l'école. On a utilisé le timer visuel, ça a mieux fonctionné. Journée moyenne ensuite.",
      tags: ["school"],
    },
    {
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(17),
      text: "Lucas a dormi 10h cette nuit ! Du coup journée exceptionnelle : concentré, calme, souriant. On voit vraiment la différence quand il dort bien.",
      tags: ["sleep", "victory"],
    },
    {
      childId: DEMO_CHILD_1_ID,
      date: daysAgo(20),
      text: "Grosse crise en sortant de l'école. Transition difficile. On a utilisé la liste de crise, le câlin et la musique ont fonctionné.",
      tags: ["school", "crisis"],
    },
  ]);

  // ── Journal entries for Emma (3 entries) ──────────────────────────────
  await db.insert(journalEntries).values([
    {
      childId: DEMO_CHILD_2_ID,
      date: daysAgo(1),
      text: "Emma a été très concentrée sur ses puzzles aujourd'hui. Elle a fini le puzzle de 24 pièces toute seule !",
      tags: ["victory"],
    },
    {
      childId: DEMO_CHILD_2_ID,
      date: daysAgo(5),
      text: "Journée à la crèche un peu difficile, Emma était dans la lune. L'éducatrice signale des difficultés à suivre les consignes collectives.",
      tags: ["school"],
    },
    {
      childId: DEMO_CHILD_2_ID,
      date: daysAgo(9),
      text: "Bonne nuit, Emma s'est endormie rapidement. Journée fluide, pas de crise.",
      tags: ["sleep"],
    },
  ]);
  console.log("   ✅ Journal créé (10 Lucas + 3 Emma)");

  // ── Barkley behaviors for Lucas ───────────────────────────────────────
  await db.insert(barkleyBehaviors).values([
    {
      id: BEHAVIOR_1_ID,
      childId: DEMO_CHILD_1_ID,
      name: "Je range ma chambre",
      points: 1,
      icon: "🧹",
      active: true,
      sortOrder: 0,
    },
    {
      id: BEHAVIOR_2_ID,
      childId: DEMO_CHILD_1_ID,
      name: "Je prépare mon cartable",
      points: 1,
      icon: "🎒",
      active: true,
      sortOrder: 1,
    },
    {
      id: BEHAVIOR_3_ID,
      childId: DEMO_CHILD_1_ID,
      name: "Je fais mes devoirs",
      points: 1,
      icon: "📚",
      active: true,
      sortOrder: 2,
    },
    {
      id: BEHAVIOR_4_ID,
      childId: DEMO_CHILD_1_ID,
      name: "J'écoute les consignes",
      points: 1,
      icon: "👂",
      active: true,
      sortOrder: 3,
    },
  ]);

  // ── Barkley behavior logs (current + 2 previous weeks) ───────────────
  const behaviorIds = [BEHAVIOR_1_ID, BEHAVIOR_2_ID, BEHAVIOR_3_ID, BEHAVIOR_4_ID];
  const logs: { behaviorId: string; date: string; completed: boolean }[] = [];

  // Current week: ~70% completion
  const currentMonday = getMondayOfWeek(0);
  const todayDayOfWeek = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
  for (let dayOffset = 0; dayOffset <= Math.min(todayDayOfWeek, 6); dayOffset++) {
    for (let bIdx = 0; bIdx < behaviorIds.length; bIdx++) {
      logs.push({
        behaviorId: behaviorIds[bIdx]!,
        date: weekDay(currentMonday, dayOffset),
        completed: !((dayOffset + bIdx) % 4 === 3),
      });
    }
  }

  // Previous week: ~60% completion
  const prevMonday = getMondayOfWeek(1);
  for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
    for (let bIdx = 0; bIdx < behaviorIds.length; bIdx++) {
      logs.push({
        behaviorId: behaviorIds[bIdx]!,
        date: weekDay(prevMonday, dayOffset),
        completed: !((dayOffset + bIdx) % 3 === 2),
      });
    }
  }

  // Two weeks ago: ~50% completion
  const prevPrevMonday = getMondayOfWeek(2);
  for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
    for (let bIdx = 0; bIdx < behaviorIds.length; bIdx++) {
      logs.push({
        behaviorId: behaviorIds[bIdx]!,
        date: weekDay(prevPrevMonday, dayOffset),
        completed: (dayOffset + bIdx) % 2 === 0,
      });
    }
  }

  await db.insert(barkleyBehaviorLogs).values(logs);
  const totalStars = logs.filter((l) => l.completed).length;

  // ── Barkley rewards (calibrated to total stars) ───────────────────────
  await db.insert(barkleyRewards).values([
    {
      childId: DEMO_CHILD_1_ID,
      name: "Choisir l'histoire du soir",
      icon: "📖",
      starsRequired: 5,
      claimedAt: daysAgoDate(7),
      sortOrder: 0,
    },
    {
      childId: DEMO_CHILD_1_ID,
      name: "Soirée film en famille",
      icon: "🎬",
      starsRequired: Math.max(5, totalStars - 2),
      sortOrder: 1,
    },
    {
      childId: DEMO_CHILD_1_ID,
      name: "30 min de jeux vidéo",
      icon: "🎮",
      starsRequired: Math.max(5, totalStars + 5),
      sortOrder: 2,
    },
    {
      childId: DEMO_CHILD_1_ID,
      name: "Sortie piscine",
      icon: "🏊",
      starsRequired: Math.max(5, totalStars + 20),
      sortOrder: 3,
    },
    {
      childId: DEMO_CHILD_1_ID,
      name: "Sortie spéciale au zoo",
      icon: "🦁",
      starsRequired: Math.max(5, totalStars + 40),
      sortOrder: 4,
    },
  ]);
  console.log(`   ✅ Barkley: 4 comportements + ${logs.length} logs + 5 récompenses (${totalStars} ⭐)`);

  // ── Barkley steps for Lucas (1-5 completed) ──────────────────────────
  await db.insert(barkleySteps).values([
    {
      childId: DEMO_CHILD_1_ID,
      stepNumber: 1,
      completedAt: daysAgoDate(21),
      notes: "Première semaine : mise en place du tableau. Lucas est curieux et motivé.",
    },
    {
      childId: DEMO_CHILD_1_ID,
      stepNumber: 2,
      completedAt: daysAgoDate(17),
      notes: "On a identifié les 4 comportements cibles ensemble. Il a choisi les icônes lui-même.",
    },
    {
      childId: DEMO_CHILD_1_ID,
      stepNumber: 3,
      completedAt: daysAgoDate(13),
      notes: "Première évaluation : progrès encourageants sur le rangement de la chambre.",
    },
    {
      childId: DEMO_CHILD_1_ID,
      stepNumber: 4,
      completedAt: daysAgoDate(9),
      notes: "Lucas commence à anticiper ses étoiles. Il prépare son cartable sans qu'on le rappelle.",
    },
    {
      childId: DEMO_CHILD_1_ID,
      stepNumber: 5,
      completedAt: daysAgoDate(5),
      notes: "Bilan mi-parcours : nette amélioration de l'autonomie. On continue !",
    },
  ]);
  console.log("   ✅ Barkley: étapes 1-5 complétées");

  // ── Crisis items for Lucas ────────────────────────────────────────────
  await db.insert(crisisItems).values([
    { childId: DEMO_CHILD_1_ID, label: "Câliner mon doudou", emoji: "🧸", position: 0 },
    { childId: DEMO_CHILD_1_ID, label: "Écouter de la musique douce", emoji: "🎵", position: 1 },
    { childId: DEMO_CHILD_1_ID, label: "Respirer profondément", emoji: "🧘", position: 2 },
    { childId: DEMO_CHILD_1_ID, label: "Courir ou sauter dehors", emoji: "🏃", position: 3 },
    { childId: DEMO_CHILD_1_ID, label: "Un gros câlin", emoji: "🤗", position: 4 },
    { childId: DEMO_CHILD_1_ID, label: "Dessiner ou colorier", emoji: "🖍️", position: 5 },
    { childId: DEMO_CHILD_1_ID, label: "Lire une histoire", emoji: "📚", position: 6 },
    { childId: DEMO_CHILD_1_ID, label: "Faire un puzzle", emoji: "🧩", position: 7 },
  ]);
  console.log("   ✅ 8 items de crise créés");

  // ── News articles ────────────────────────────────────────────────
  await db.delete(news);
  await db.insert(news).values([
    {
      title: "Bienvenue sur Toko !",
      slug: "bienvenue-sur-toko",
      excerpt:
        "Toko est votre compagnon quotidien pour accompagner votre enfant TDAH. Voici comment tirer le meilleur parti de l'application.",
      content: `## Bienvenue dans Toko

Toko a ete concu par des parents, pour des parents. Notre objectif : vous donner des outils concrets pour accompagner votre enfant TDAH au quotidien.

### Ce que vous pouvez faire

- **Suivi des symptomes** : notez chaque jour le sommeil, la concentration, l'agitation et l'humeur de votre enfant
- **Journal** : gardez une trace des moments cles, des progres et des difficultes
- **Liste de crise** : preparez a l'avance les strategies qui fonctionnent pour votre enfant
- **Programme Barkley** : suivez un programme structure en 8 etapes
- **Recompenses** : motivez votre enfant avec un systeme de points positifs

### Commencez par

1. Ajouter votre enfant dans le menu
2. Remplir le suivi des symptomes du jour
3. Ecrire une premiere entree dans le journal

Bonne decouverte !`,
      authorId: userId,
      published: true,
      publishedAt: daysAgoDate(14),
    },
    {
      title: "Nouveau : suivi des medicaments",
      slug: "nouveau-suivi-des-medicaments",
      excerpt:
        "Vous pouvez maintenant suivre la prise de medicaments de votre enfant directement dans Toko. Bilan, rappels et historique.",
      content: `## Suivi des medicaments

Une des demandes les plus frequentes : pouvoir noter si le medicament a ete pris, et observer l'effet sur les symptomes.

### Comment ca marche

- Ajoutez les medicaments de votre enfant (nom, dosage, horaires)
- Chaque jour, cochez les prises effectuees
- Le tableau de bord croises les donnees : sommeil, concentration et humeur les jours avec/sans medicament

### Pourquoi c'est utile

Lors du prochain rendez-vous avec le pedopsychiatre, vous aurez des donnees concretes a montrer. Plus besoin de deviner : les chiffres parlent.

Retrouvez cette fonctionnalite dans le menu **Medicaments**.`,
      authorId: userId,
      published: true,
      publishedAt: daysAgoDate(7),
    },
    {
      title: "Conseils pour la rentree scolaire TDAH",
      slug: "conseils-rentree-scolaire-tdah",
      excerpt:
        "La rentree peut etre stressante pour un enfant TDAH. Voici nos conseils pour preparer la transition en douceur.",
      content: `## Preparer la rentree

La rentre est souvent un moment delicat pour les enfants TDAH. Le changement de routine, les nouvelles attentes et la fatigue accumulee peuvent amplifier les difficultes.

### Avant la rentree

- **Reinstaurez le rythme** : 2 semaines avant, recalez progressivement les heures de coucher et de lever
- **Visitez l'ecole** : si possible, faites decouvrir les lieux a votre enfant avant le jour J
- **Preparez les affaires ensemble** : impliquez votre enfant dans le choix du cartable et la preparation

### Les premiers jours

- **Soyez present** : accompagnez votre enfant aussi longtemps que necessaire
- **Ecoutez sans juger** : laissez-le raconter sa journee a son rythme
- **Notez les observations** : utilisez le journal Toko pour suivre l'adaptation

### Communication avec l'ecole

- Prenez rendez-vous rapidement avec l'enseignant pour expliquer les besoins de votre enfant
- Partagez le rapport Toko si vous le souhaitez — il donne une vue claire des symptomes et progres

La cle : anticiper et communiquer. Votre enfant a toutes les capacites de reussir sa rentree.`,
      authorId: userId,
      published: true,
      publishedAt: daysAgoDate(2),
    },
    {
      title: "A venir : rapport PDF pour le pedopsychiatre",
      slug: "a-venir-rapport-pdf-pedopsychiatre",
      excerpt:
        "Nous travaillons sur une fonctionnalite de generation de rapport PDF que vous pourrez partager avec le medecin de votre enfant.",
      content: `## Rapport PDF medical

Nous preparons une fonctionnalite tres demandee : la generation d'un rapport PDF synthetique que vous pourrez imprimer ou envoyer au pedopsychiatre.

### Ce que le rapport contiendra

- Evolution des symptomes sur la periode choisie
- Graphiques de tendance (sommeil, concentration, humeur)
- Donnees de prise de medicaments
- Notes du journal selectionnees
- Score de consistance fonctionnelle

### Pourquoi c'est important

Les consultations sont courtes. Un rapport clair et factuel permet au medecin de comprendre rapidement la situation et d'ajuster le suivi.

Restez connectes, cette fonctionnalite arrive bientot !`,
      authorId: userId,
      published: false,
      publishedAt: null,
    },
  ]);
  console.log("   ✅ 4 articles d'actualité créés (3 publiés, 1 brouillon)");

  console.log("✅ Données démo complètes !");
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
