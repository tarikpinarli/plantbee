import { LeaderboardPodium } from "@/components/ui/LeaderboardPodium";
import { LeaderboardSkeleton } from "@/components/ui/LeaderboardSkeleton";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { PageHeader } from "@/components/ui/PageHeader";
import AuthContext from "@/context/AuthContext";
import type { LeaderboardItem } from "@/types/leaderboard.types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(Array.isArray(json?.rankings) ? json.rankings : []);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <LeaderboardSkeleton />;

  const safeData = Array.isArray(data) ? data : [];
  const enriched = safeData.map(item => ({
    ...item,
    isMe: item.user_id === Number(currentUserId),
  }));

  const podium = enriched.slice(0, 3);
  const table = enriched.slice(3);

  return (
    <section className="p-8">

      <PageHeader
        title={t("leaderboard.pageTitle")}
        content={t("leaderboard.pageContent")}
      />

      <LeaderboardPodium data={podium} />

      <LeaderboardTable data={table} />

      {/* Redirect to Tasks */}
			<div className="mt-12 bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
        <h4 className="text-2xl font-black mb-3">{t("leaderboard.ctaTitle")}</h4>
        <p className="text-gray-300 mb-6">{t("leaderboard.ctaContent")}</p>
        <button
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          onClick={() => navigate({to: "/tasks"})}
        >
          {t("leaderboard.ctaButton")}
        </button>
			</div>

    </section>
  );
}
