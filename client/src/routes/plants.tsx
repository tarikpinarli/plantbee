import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/plants')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/plants"!</div>
}
