import { LeaderboardPodium } from "@/components/ui/LeaderboardPodium";
import { LeaderboardSkeleton } from "@/components/ui/LeaderboardSkeleton";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { PageHeader } from "@/components/ui/PageHeader";
import type { LeaderboardItem } from "@/types/leaderboard.types";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const podium = data.slice(0, 3);
  const table = data.slice(3);

  return (
    <section className="p-8">
      <PageHeader 
        title="Green Guardians" 
        content="Every drop counts! Join the effort, stay hydrated, and help our shared greenery thrive."
      />

      <LeaderboardPodium data={podium} />

      <LeaderboardTable data={table} />

      {/* CTA Section */}
			<div className="mt-12 bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
				<div className="max-w-2xl">
					<h4 className="text-2xl font-black mb-3">Want to climb the ranks?</h4>
					<p className="text-gray-300 mb-6">Every watering task completed earns you points. Visit the task board to see which plants need your attention right now.</p>
					<button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
						View Active Tasks
					</button>
				</div>

				{/* Stats Row */}
				<div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-700">
					<div>
						<div className="text-emerald-400 text-sm font-bold tracking-widest mb-1">TOTAL LITERS</div>
						<div className="text-4xl font-black">14.2k</div>
					</div>
					<div>
						<div className="text-emerald-400 text-sm font-bold tracking-widest mb-1">ACTIVE GUARDIANS</div>
						<div className="text-4xl font-black">452</div>
					</div>
				</div>
			</div>
    </section>
  );
}
