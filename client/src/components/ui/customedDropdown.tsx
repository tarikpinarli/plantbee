import type { ComponentProps, ReactNode } from "react";

type Option = {
	label: string;
	value: string;
}

interface SelectProps extends ComponentProps<"select"> {
	label?: ReactNode;
	options: Option[];
	error?: string;
}

export const CustomedDropdown = ({className, label, options, error, ...rest}: SelectProps) => {
	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="text-sm font-semibold text-gray-700">{label}</label>
			)}

			<select
				className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${className || ""}`}
				{...rest}
			>
				{
					options.map(opt => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))
				}
			</select>

			{error &&  (
				<span className="text-xs text-red-500">{error}</span>
			)}
		</div>
	);
};