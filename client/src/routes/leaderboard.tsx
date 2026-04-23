import { LeaderboardPodium } from "@/components/ui/LeaderboardPodium";
import { LeaderboardSkeleton } from "@/components/ui/LeaderboardSkeleton";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { PageHeader } from "@/components/ui/PageHeader";
import AuthContext from "@/context/AuthContext";
import type { LeaderboardItem } from "@/types/leaderboard.types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useContext, useEffect, useState } from "react";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [leaderboardRes] = await Promise.all([
        fetch('/api/leaderboard').then(r => r.json()),
      ]);

      setData(leaderboardRes.rankings);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <LeaderboardSkeleton />;

  const enriched = data.map(item => ({
    ...item,
    isMe: item.user_id === Number(currentUserId),
  }));

  const podium = enriched.slice(0, 3);
  const table = enriched.slice(3);

  return (
    <section className="p-8">

      <PageHeader 
        title="Green Guardians" 
        content="Every drop counts! Join the effort, stay hydrated, and help our shared greenery thrive."
      />

      <LeaderboardPodium data={podium} />

      <LeaderboardTable data={table} />

      {/* Redirect to Tasks */}
			<div className="mt-12 bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
        <h4 className="text-2xl font-black mb-3">Want to climb the ranks?</h4>
        <p className="text-gray-300 mb-6">Every watering task completed earns you points. Visit the task board to see which plants need your attention right now.</p>
        <button 
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          onClick={() => navigate({to: "/tasks"})}
        >
          View Active Tasks
        </button>
			</div>

    </section>
  );
}
