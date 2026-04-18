import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NewLeadModalProvider } from "./NewLeadModalContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
    isActive ? "bg-blue-100 text-blue-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

function LayoutShell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="text-base font-bold tracking-tight text-slate-900">
          Uptown Leads
        </Link>
        <nav className="flex flex-1 flex-wrap gap-1" aria-label="Main">
          <NavLink to="/" className={navLinkClass} end>
            Dashboard
          </NavLink>
          <NavLink to="/leads" className={navLinkClass}>
            Leads
          </NavLink>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="max-w-40 truncate text-sm text-slate-500" title={user?.email}>
              {user?.name}
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export function Layout() {
  return (
    <NewLeadModalProvider>
      <LayoutShell />
    </NewLeadModalProvider>
  );
}
