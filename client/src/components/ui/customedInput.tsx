
import { type ComponentProps, type ReactNode } from "react";

interface InputProps extends ComponentProps<"input"> {
	label?: ReactNode;
	error?: string;
}

export const CustomedInput = ({label, className, type, error, ...props}: InputProps) => {
	const baseStyles = 
		type === "range"
			? ""
			: "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
	return (
		<div className="flex flex-col gap-1">

			{label && (
				<label className="text-sm font-semibold text-gray-700">
					{label}
          		</label>
			)}

			<input 
				type={type}
				className={`${baseStyles} ${className || ""}`}
				{...props}
			/>

			{error &&  (
				<span className="text-xs text-red-500">{error}</span>
			)}
		</div>		
	);
};
