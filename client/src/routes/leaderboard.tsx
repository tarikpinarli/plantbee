import { PageHeader } from "@/components/ui/PageHeader";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/leaderboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <section>
        <PageHeader title="Leaderboard" content="Every drop counts! Join the effort, stay hydrated, and help our shared greenery thrive."/>
      </section>
    </>
  );
}
