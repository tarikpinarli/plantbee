// /login     Login page
import { LoginButton } from '@/components/ui/LoginButton'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (<section>
    <h1>Login to your 42 account to use PlantBee</h1>
    <LoginButton/>
  </section>)
}
