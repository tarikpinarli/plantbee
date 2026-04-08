import { uploadImage } from "@/utils/uploadImage";
import { useState } from "react";

export function useImageUpload() {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const upload = async (file: File): Promise<string | null> => {
		setUploading(true);
		setError(null);
		try {
			const url = await uploadImage(file);
			return url;
		} catch (err) {
			setError("Upload failed");
			return null;
		} finally {
			setUploading(false);
		}
	};

	return {
		upload, 
		uploading, 
		error,
	};

}

