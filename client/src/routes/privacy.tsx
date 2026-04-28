import { PageHeader } from "@/components/ui/PageHeader";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <PageHeader title={t("privacy.title")} />

      <ol className="space-y-8 text-slate-700 dark:text-slate-300">
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.0.heading")}</h2>
          <p>{t("privacy.sections.0.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.1.heading")}</h2>
          <p>{t("privacy.sections.1.content")}</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            {(t("privacy.sections.1.items", { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.2.heading")}</h2>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            {(t("privacy.sections.2.items", { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.3.heading")}</h2>
          <p>{t("privacy.sections.3.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.4.heading")}</h2>
          <p>{t("privacy.sections.4.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.5.heading")}</h2>
          <p>{t("privacy.sections.5.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.6.heading")}</h2>
          <p>{t("privacy.sections.6.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.7.heading")}</h2>
          <p>{t("privacy.sections.7.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.8.heading")}</h2>
          <p>{t("privacy.sections.8.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.9.heading")}</h2>
          <p>{t("privacy.sections.9.content")}</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            {(t("privacy.sections.9.items", { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="mt-2">{t("privacy.sections.9.note")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.10.heading")}</h2>
          <p>{t("privacy.sections.10.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.11.heading")}</h2>
          <p>{t("privacy.sections.11.content")}</p>
        </li>
        <li>
          <h2 className="text-xl font-semibold mb-2">{t("privacy.sections.12.heading")}</h2>
          <p>{t("privacy.sections.12.content")}</p>
        </li>
      </ol>
      <p className="text-sm font-medium mt-12 bg-green-500/10 p-4 rounded-lg border border-green-500/30">
        {t("privacy.lastUpdated")}
      </p>
    </section>
  );
}