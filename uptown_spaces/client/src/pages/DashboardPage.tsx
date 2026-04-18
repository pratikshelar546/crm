import { useEffect, useState } from "react";
import { useNewLeadModal } from "../components/NewLeadModalContext";
import * as leadsApi from "../api/leads";
import { STATUS_LABELS } from "../constants/leads";
import type { LeadStatus } from "../types/leads";
import { getApiErrorMessage } from "../lib/http";

export function DashboardPage() {
  const { openNewLead } = useNewLeadModal();
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof leadsApi.fetchDashboard>> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await leadsApi.fetchDashboard();
        if (!cancelled) setMetrics(data);
      } catch (e) {
        if (!cancelled) setError(getApiErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-slate-500" role="status">
        Loading dashboard…
      </p>
    );
  }

  if (error || !metrics) {
    return (
      <div
        className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        role="alert"
      >
        {error ?? "Could not load dashboard."}
      </div>
    );
  }

  const statusLabel = (s: string) =>
    s in STATUS_LABELS ? STATUS_LABELS[s as LeadStatus] : s;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of your lead pipeline.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800"
          onClick={openNewLead}
        >
          New lead
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Total leads</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{metrics.totalLeads}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Conversion rate</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{metrics.conversionRate}%</div>
          <div className="mt-1 text-xs text-slate-500">Closed ÷ total</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Leads by source</h2>
          {metrics.leadsBySource.length === 0 ? (
            <p className="text-sm text-slate-500">No data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Source
                    </th>
                    <th className="py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.leadsBySource.map((row) => (
                    <tr key={row.source} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3 text-slate-800">{row.source}</td>
                      <td className="py-2 text-right tabular-nums text-slate-800">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Status distribution</h2>
          {metrics.statusDistribution.length === 0 ? (
            <p className="text-sm text-slate-500">No data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.statusDistribution.map((row) => (
                    <tr key={row.status} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3 text-slate-800">{statusLabel(row.status)}</td>
                      <td className="py-2 text-right tabular-nums text-slate-800">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
