
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
} 

// import * as React from "react"

// import { cn } from "@/lib/utils"

// function Input({ className, type, ...props }: React.ComponentProps<"input">) {
//   return (
//     <input
//       type={type}
//       data-slot="input"
//       className={cn(
//         "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
//         "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
//         "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
//         className
//       )}
//       {...props}
//     />
//   )
// }

// export { Input }
