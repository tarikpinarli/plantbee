import { getCurrentUser } from "@/utils/helper"
import { useQuery } from "@tanstack/react-query"

export const useCurrentOwnerId = () => {
	return useQuery({
		queryKey: ['me'],
		queryFn: getCurrentUser,
	});
};