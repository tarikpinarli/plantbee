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
  const [me, setMe] = useState<{user_id: number} | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [leaderboardRes, meRes] = await Promise.all([
        fetch('/api/leaderboard').then(r => r.json()),
        fetch('/auth/me').then(r => r.json()),
      ]);

      setData(leaderboardRes.rankings);
      setMe(meRes);

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

      <LeaderboardTable
        data={table}
        currentUserId={me?.user_id}
      />

    </section>
  );
}
