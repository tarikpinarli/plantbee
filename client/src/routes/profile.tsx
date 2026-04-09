import { useAuth } from "@/hooks/useAuth";
import { requireAuth } from "@/utils/helper";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/profile')({
  beforeLoad: requireAuth,
  component: Profile,
});

function Profile() {
  const {user} = useAuth();
  return <section className="p-2"><h1>Hello {user && user.login}!</h1></section>;
}
