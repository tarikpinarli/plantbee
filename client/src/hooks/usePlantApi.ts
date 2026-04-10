import type { PlantFormData } from "@/types/plant.types"
import { useState } from "react"

type ApiErrorResponse = {
	field?: keyof PlantFormData;
	error?: string;
}

export function usePlantApi() {
	// Tracks what's happening with the API call
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  	// save addPlant error
  	const [apiError, setApiError] = useState<string | null>(null)

	const createPlant = async (payload: PlantFormData) => {
		setStatus('loading')
     	setApiError(null);

		try {
			const response = await fetch('/api/plants/add', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),   // ← this converts JS object to JSON string
			})

			const data: ApiErrorResponse = await response.json();

			// console.log("Full backend response:", data); //log server error

			if (!response.ok) {
				throw new Error(data.error || 'Server error');
			}

			setStatus('success');
			return true;

		} catch (err: unknown) {
			if (err instanceof Error) {
				setApiError(err.message);
			} else {
				setApiError('Unknown error');
			}
			
			setStatus('error');
			return false;
		}
	};
	
	return {createPlant, status, apiError };
}

