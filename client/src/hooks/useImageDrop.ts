import React, { useEffect, useState } from "react"

/** This hook accepts any file whose MIME type starts with "image/". Includes: 
	JPEG → "image/jpeg"
	PNG → "image/png"
	GIF → "image/gif"
	WebP → "image/webp"
	SVG → "image/svg+xml"
	BMP → "image/bmp"
	HEIC (sometimes) → "image/heic" (depends on browser support)
	So it does not restrict to specific formats, just anything recognized as an image by the browser. */
export function useImageDrop () {
	const [image, setImage] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const updateImage = (file: File | null) => {
		setImage(file);

		if (file) {
			const url = URL.createObjectURL(file);
			setPreview(url);
		} else {
			setPreview(null);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith("image/")) {
			updateImage(file);
		}
	};

	const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement> | null) => {
		if (!e) {
			updateImage(null);
			return;
		}
		if (e.target.files && e.target.files[0]) {
			updateImage(e.target.files[0]);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	useEffect(() => {
		return () => {
			if (preview) URL.revokeObjectURL(preview);
		};
	}, [preview]);

	return {
		image,
		preview,
		handleDrop,
		handleChangeImage,
		handleDragOver,
	};
}