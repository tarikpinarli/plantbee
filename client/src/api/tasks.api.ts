export async function getTasks() {
  const response = await fetch("/api/tasks");
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return (await response.json()) ?? [];
}

export async function acceptTask(taskId: number): Promise<void> {
  const response = await fetch("/api/tasks/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: taskId }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
}

export async function cancelTask(taskId: number): Promise<void> {
  const response = await fetch("/api/tasks/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: taskId }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
}