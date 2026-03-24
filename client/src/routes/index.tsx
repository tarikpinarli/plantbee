// / welcome page

import { LoginButton } from "@/components/ui/LoginButton";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <LoginButton/>
    </div>
  );
}
