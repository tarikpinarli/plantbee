import type React from "react";
import { useRef } from "react";

interface ImageDropZoneProps {
	preview: string | null;
	onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onRemove: () => void;
}

export const ImageDropZone = ({preview, onDrop, onDragOver, onChange, onRemove} : ImageDropZoneProps) => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	return (
		<div className="flex flex-col items-center gap-3">
      
			{/* Drop area */}
			<div
				className="w-full md:w-50 h-32 md:h-48 flex flex-col items-center 
				justify-center border-2 border-dashed border-green-200 bg-green-50 
				text-gray-400 rounded-lg cursor-pointer hover:bg-green-100 transition"
				onDrop={onDrop}
				onDragOver={onDragOver}
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
					onChange={onChange}
					className="hidden"
				/>
			</div>

			{/* Remove button */}
			{preview && (
				<button
					type="button"
					onClick={onRemove}
					className="text-xs text-red-500 hover:underline"
				>
					Remove image
				</button>
			)}
			</div>
	);
}