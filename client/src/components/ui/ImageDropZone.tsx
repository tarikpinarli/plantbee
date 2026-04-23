import type React from "react";
import { useEffect, useRef } from "react";

type ImageDropZoneProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
};

export const ImageDropZone = ({value, onChange, error} : ImageDropZoneProps) => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const preview = value ? URL.createObjectURL(value) : null;

	useEffect(() => {
		return () => {
		if (preview) URL.revokeObjectURL(preview);
		};
	}, [preview]);

	const handleFile = (file: File | null) => {
		if (file && file.type.startsWith("image/")) {
			onChange(file);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		handleFile(e.dataTransfer.files[0]);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFile(e.target.files?.[0] || null);
	};

	return (
		<div className="flex flex-col items-center gap-3">
      
			{/* Drop area */}
			<div
				className="w-full md:w-50 h-32 md:h-48 flex flex-col items-center 
				justify-center border-2 border-dashed border-green-200 bg-green-50 
				text-gray-400 rounded-lg cursor-pointer hover:bg-green-100 transition"
				onDrop={handleDrop}
				onDragOver={(e) => e.preventDefault()}
				onClick={() => fileInputRef.current?.click()}
			>
				{!preview ? (
				<p className="text-xs italic text-center px-2">
					Drag & drop or click to upload
				</p>
				) : (
				<img
					src={preview}
					alt="Preview"
					className="w-full h-full object-cover rounded-lg"
				/>
				)}

				<input
					type="file"
					accept="image/*"
					ref={fileInputRef}
					onChange={handleInputChange}
					className="hidden"
				/>
			</div>

			{/* Remove button */}
			{value && (
				<button
					type="button"
					onClick={() => onChange(null)}
					className="text-xs text-red-500 hover:underline"
				>
					Remove image
				</button>
			)}

			{error && (
				<span className="text-xs text-red-500">{error}</span>
			)}
			</div>
	);
}