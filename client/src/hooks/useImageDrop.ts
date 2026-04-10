import React, { useState } from "react"

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

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith("image/")) {
			setImage(file);
		}
	};

	const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement> | null) => {
		if (!e) {
			setImage(null);
			return;
		}
		if (e.target.files && e.target.files[0]) {
			setImage(e.target.files[0]);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	return {
		image,
		handleDrop,
		handleChangeImage,
		handleDragOver,
	};
}