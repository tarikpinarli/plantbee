import { PageHeader } from "@/components/ui/PageHeader";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  const { t } = useTranslation();

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <PageHeader title={t("terms.title")} />

      <ol className="space-y-8 text-slate-700 dark:text-slate-300">
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.0.heading")}</h2>
          <p>{t("terms.sections.0.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.1.heading")}</h2>
          <p>{t("terms.sections.1.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.2.heading")}</h2>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            {(t("terms.sections.2.items", { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.3.heading")}</h2>
          <p>{t("terms.sections.3.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.4.heading")}</h2>
          <p>{t("terms.sections.4.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.5.heading")}</h2>
          <p>{t("terms.sections.5.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.6.heading")}</h2>
          <p>{t("terms.sections.6.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.7.heading")}</h2>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            {(t("terms.sections.7.items", { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.8.heading")}</h2>
          <p>{t("terms.sections.8.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.9.heading")}</h2>
          <p>{t("terms.sections.9.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.10.heading")}</h2>
          <p>{t("terms.sections.10.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.11.heading")}</h2>
          <p>{t("terms.sections.11.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("terms.sections.12.heading")}</h2>
          <p>{t("terms.sections.12.content")}</p>
        </li>
      </ol>
      <p className="text-sm font-medium mt-12 bg-green-500/10 p-4 rounded-lg border border-green-500/30">
        {t("terms.lastUpdated")}
      </p>
    </section>
  );
}