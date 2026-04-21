import { useNavigate, useSearch } from "@tanstack/react-router";

export function usePlantSearch() {
	const search = useSearch({ from: '/garden'});
	const navigate = useNavigate({from: '/garden'});

	const setSearch = (updates: Partial<typeof search>) => {
		navigate({
			search: (prev) => ({
			...prev,
			...updates,
			}),
		});
	};

	return { ...search, setSearch};
}