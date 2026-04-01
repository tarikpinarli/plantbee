import React, { useState } from "react"

export function useImageDrop () {
	const [image, setImage] = useState<File | null>(null);

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith("image/")) {
			setImage(file);
		}
	};

	const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
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