import { JSX } from 'react';

import { InputPropsType } from './input.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

/** Variants for the Input component. */
export const { variants: inputVariants, types: InputVariantTypes } = makeVariants({
	base: 'w-full min-w-20 rounded-md border-2 outline-2 outline-offset-2 outline-transparent transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-input-placeholder focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50',
	variants: {
		variant: {
			default: 'border-muted-light bg-background',
			filled: 'border-transparent bg-muted-light',
			ghost: 'border-transparent outline-none focus-visible:outline-none',
		},
		inputSize: {
			sm: 'max-w-48 px-2 py-1 text-sm',
			default: 'max-w-60 px-2.5 py-1.5 text-sm',
			lg: 'max-w-80 px-3 py-2 text-base',
			full: 'max-w-full px-2.5 py-1.5 text-sm',
		},
		state: {
			default: '',
			error: 'border-danger',
			success: 'border-success',
			warn: 'border-warn',
		},
	},
	default: {
		variant: 'default',
		inputSize: 'default',
		state: 'default',
	},
});

/**
 * @name Input
 * @description Single-line text field for capturing short pieces of information such as names, emails, or search queries.
 * @returns {JSX.Element} The Input component.
 */
export function Input({
	state = 'default',

	variant = 'default',
	inputSize = 'default',
	className,

	...props
}: InputPropsType): JSX.Element {
	return (
		<input
			className={cn(inputVariants({ inputSize, variant, state }), className)}
			data-slot="input"
			aria-label={props.title ?? props.name ?? 'Input'}
			aria-required={props.required}
			aria-invalid={state === 'error'}
			aria-disabled={props.disabled}
			{...props}
		/>
	);
}
