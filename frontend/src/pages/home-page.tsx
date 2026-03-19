import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const waitlistSchema = z.object({
  name: z.string().min(2, 'Enter a plant name or area name.'),
  email: z.email('Enter a valid email address.'),
});

type WaitlistValues = z.infer<typeof waitlistSchema>;

const stackItems = [
  'Tailwind CSS',
  'shadcn/ui-ready aliases',
  'React Router',
  'TanStack Query',
  'React Hook Form + Zod',
  'ESLint + Prettier',
  'Vite + TypeScript',
];

const defaultValues: WaitlistValues = {
  name: '',
  email: '',
};

export function HomePage() {
  const [submitted, setSubmitted] = useState<WaitlistValues | null>(null);
  const { data } = useQuery({
    queryKey: ['frontend-stack'],
    queryFn: () => stackItems,
    staleTime: Infinity,
  });
  const form = useForm<WaitlistValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues,
  });
  const handleWaitlistSubmit = form.handleSubmit((values) => {
    setSubmitted(values);
    form.reset(defaultValues);
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-12 md:px-10">
      <section className="grid gap-6 rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_20px_70px_rgba(55,74,45,0.08)] backdrop-blur md:grid-cols-[1.4fr_1fr] md:p-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900">
            <Sprout className="h-4 w-4" />
            Frontend starter for PlantBee
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-stone-900 md:text-6xl">
              Frontend groundwork for the dashboard your team has not built yet.
            </h1>
            <p className="max-w-xl text-base leading-7 text-stone-600 md:text-lg">
              This Vite app is set up for Docker-first development with routing,
              query caching, form validation, linting, formatting, and build
              checks ready for the first real feature branch.
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-stone-950 p-6 text-stone-100">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">
            Included
          </p>
          <ul className="mt-5 space-y-3 text-sm text-stone-300">
            {data?.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/10 px-4 py-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.75rem] border border-stone-200/80 bg-stone-50/80 p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
            Starter route
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-stone-900">
            Ready for feature work
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-stone-600">
            The home page is intentionally lightweight. It demonstrates the
            provider stack, Tailwind styling, React Router wiring, TanStack
            Query usage, and a validated form without forcing product decisions
            yet.
          </p>
        </article>

        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-stone-500">
              Validation demo
            </p>
            <h2 className="text-2xl font-semibold text-stone-900">
              Join the build queue
            </h2>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              void handleWaitlistSubmit(event);
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">
                Plant or area
              </span>
              <input
                className="w-full rounded-2xl border bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                placeholder="Office monstera"
                {...form.register('name')}
              />
              {form.formState.errors.name ? (
                <span className="text-sm text-red-600">
                  {form.formState.errors.name.message}
                </span>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Email</span>
              <input
                className="w-full rounded-2xl border bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                placeholder="team@plantbee.local"
                {...form.register('email')}
              />
              {form.formState.errors.email ? (
                <span className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </span>
              ) : null}
            </label>

            <button
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              type="submit"
            >
              Save placeholder
            </button>
          </form>

          {submitted ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              Saved <strong>{submitted.name}</strong> for{' '}
              <strong>{submitted.email}</strong>.
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
