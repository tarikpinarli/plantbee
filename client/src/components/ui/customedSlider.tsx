import type { ComponentProps } from "react"
import { CustomedInput } from "./customedInput"

interface SliderProps extends Omit<ComponentProps<"input">, "onChange"> {
	label?: string;
	min?: number;
	max?: number;
	value: number;
	onChange: (value: number) => void;
}

export const CustomedSlider = ({label, min = 0, max = 100, value, onChange, className, ...props}: SliderProps) => {
	return (
		<div className="flex flex-col">
			<label className="text-sm font-semibold text-gray-700">
				{label}
          	</label>

			<CustomedInput
				type="range"
				min={min}
				max={max}
				step={1}
				value={value}
				onChange={e => onChange(Number(e.target.value))}
				className={`accent-green-400 ${className || ""}`}
				// style={{ accentColor: "#22c55e"}}
				{...props}
			/>

			<div className="flex justify-between text-xs text-gray-400">
				<span>0% Dry</span>
				<span>50%</span>
				<span>100% Wet</span>
			</div>
		</div>
	);
}