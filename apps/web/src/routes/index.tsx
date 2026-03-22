import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500">
          Bienvenue sur Tokō — L'application qui aide les parents à guider leur
          enfant TDAH, un jour à la fois.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Médicaments" value="—" subtitle="aujourd'hui" />
        <KpiCard title="Série" value="—" subtitle="jours consécutifs" />
        <KpiCard title="Prochain RDV" value="—" subtitle="aucun planifié" />
        <KpiCard title="Humeur" value="—" subtitle="tendance" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Commencez par ajouter votre enfant
        </h2>
        <p className="text-sm text-slate-500">
          Ajoutez les informations de votre enfant pour commencer le suivi des
          symptômes et des médicaments.
        </p>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}
