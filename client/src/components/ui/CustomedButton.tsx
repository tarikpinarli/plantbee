import { type ComponentProps } from "react"

/** The children prop is a unique feature in React components. It allows developers to pass JSX elements as children to a component, enabling more flexible and reusable code. 
 * By extending ButtonProps with ComponentProps<"button">, you’re automatically inheriting all the standard props that a native HTML button element can accept, such as onClick, type, disabled, and more.
 */

export const SharedButton = ({ className , ...rest }: ComponentProps<"button">) => {
	return (
		<button
			className={`mt-2 accent-green-400 hover:accent-green-600 disabled:bg-green-300 text-black font-semibold py-3 rounded-lg transition-colors  ${className || ""}`}
			{...rest}
		>
			
		</button>
	);
};