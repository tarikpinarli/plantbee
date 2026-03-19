import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, RefreshCcw, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProxyResponse {
  status: string;
  message: string;
  timestamp: string;
  proxy_verified: boolean;
}

export function TestProxyPage() {
  const { data, isLoading, isError, refetch, isFetching } =
    useQuery<ProxyResponse>({
      queryKey: ['test-proxy'],
      queryFn: async () => {
        const response = await fetch('/api/test-proxy');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      },
      retry: 1,
    });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition-colors hover:bg-stone-50"
        >
          <ArrowLeft className="h-5 w-5 text-stone-600" />
        </Link>
        <h1 className="text-3xl font-semibold text-stone-900">
          Proxy Connection Test
        </h1>
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}
            >
              <Wifi className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">
                Backend Communication
              </p>
              <h2 className="text-lg font-semibold text-stone-900">
                {isLoading
                  ? 'Checking connection...'
                  : isError
                    ? 'Connection Failed'
                    : 'Connection Active'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="flex h-10 items-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-stone-50" />
        ) : isError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-red-700">
            <p className="font-medium">Could not reach the Go backend.</p>
            <p className="mt-1 text-sm text-red-600">
              Make sure your Docker containers are running (
              <code>docker-compose up</code>) and that the Vite proxy is
              correctly configured to <code>http://app:8080</code>.
            </p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900">
                    {data.message}
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    The request successfully traveled from your browser to Vite,
                    through the proxy, and was handled by the Go backend!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-500">
                  Status
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-stone-900 uppercase">
                  {data.status}
                </p>
              </div>
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-500">
                  Backend Timestamp
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-stone-900">
                  {new Date(data.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-950 p-4 font-mono text-sm text-emerald-400">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        ) : null}
      </section>

      <p className="text-center text-sm text-stone-500">
        Using{' '}
        <strong>
          {import.meta.env.VITE_API_URL || 'http://localhost:8080'}
        </strong>{' '}
        as proxy target.
      </p>
    </main>
  );
}
