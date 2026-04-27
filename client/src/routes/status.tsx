import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type ServiceState = "ok" | "degraded" | "down" | "unconfigured";

interface StatusPayload {
  status: ServiceState;
  services: {
    api: ServiceState;
    database: ServiceState;
  };
  timestamp: string;
}

export const Route = createFileRoute("/status")({
  component: StatusPage,
});

function StatusPage() {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/status");
      const json = (await res.json()) as StatusPayload;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">System Status</h1>
      <p className="text-sm text-slate-500 mb-6">
        {data?.timestamp ? `Last checked: ${new Date(data.timestamp).toLocaleString()}` : "—"}
      </p>

      {loading && !data && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {data && (
        <>
          <div className="mb-6 p-4 rounded-lg border" style={{ borderColor: badgeColor(data.status) }}>
            <span className="font-semibold">Overall:&nbsp;</span>
            <StatusBadge state={data.status} />
          </div>

          <ul className="divide-y border rounded-lg">
            <ServiceRow name="API" state={data.services.api} />
            <ServiceRow name="Database" state={data.services.database} />
          </ul>

          <button
            className="mt-6 px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </>
      )}
    </section>
  );
}

function ServiceRow({ name, state }: { name: string; state: ServiceState }) {
  return (
    <li className="flex items-center justify-between p-4">
      <span>{name}</span>
      <StatusBadge state={state} />
    </li>
  );
}

function StatusBadge({ state }: { state: ServiceState }) {
  const label =
    state === "ok"
      ? "Operational"
      : state === "degraded"
        ? "Degraded"
        : state === "down"
          ? "Down"
          : "Unconfigured";
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white"
      style={{ backgroundColor: badgeColor(state) }}
    >
      <span className="h-2 w-2 rounded-full bg-white" />
      {label}
    </span>
  );
}

function badgeColor(state: ServiceState): string {
  switch (state) {
    case "ok":
      return "#16a34a";
    case "degraded":
      return "#f59e0b";
    case "down":
      return "#dc2626";
    default:
      return "#64748b";
  }
}
