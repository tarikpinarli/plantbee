import type { ReactNode } from "react"
import type React from "react"
import { twMerge } from "tailwind-merge"


type ToggleProps<T extends string> = {
	label?: ReactNode,
	value: T
	options: readonly[T, T]
	onToggle: (value: T) => void
	render?: (value: T) => React.ReactNode
	className?: string
  	// disabled?: boolean
}

export const CustomedToggle = <T extends string,>( {label, value, options, onToggle, render, className, ...rest}: ToggleProps<T>) => {
	
	const [a, b] = options

	const nextValue = value === a ? b : a

	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="text-sm font-semibold text-gray-700">{label}</label>
			)}

			<button
				className={twMerge(
					"border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400",
					className
				)}
				onClick={() => onToggle(nextValue)}
				{...rest}
			>
				{render? render(value) : String(value)}
			</button>
			
		</div>
	)
}