import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-[1.75rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_20px_70px_rgba(55,74,45,0.08)] backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-stone-900">
          Route not found
        </h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          The frontend scaffold is in place, but this route has not been defined
          yet.
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white"
          to="/"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
