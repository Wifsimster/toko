import { createRootRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="text-xl font-bold text-accent-600">
            Tokō <span className="text-sm text-slate-400">登光</span>
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link
              to="/"
              className="text-slate-600 hover:text-accent-600 [&.active]:text-accent-600 [&.active]:font-semibold"
            >
              Tableau de bord
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
