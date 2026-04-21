export async function deletePlant (id:number) {
	const res = await fetch(`/api/plants/${id}`, {
		method:'DELETE',
		credentials: 'include',
	})

	if (!res.ok) {
		throw new Error('Failed to delete plant');
	}

	return true;
}