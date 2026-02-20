import { JSX } from 'react';

import { TextareaPropsType } from './textarea.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

/** Variants for the Textarea component. */
export const { variants: textareaVariants, types: TextareaVariantTypes } = makeVariants({
	base: 'w-full min-w-20 resize-none rounded-md border-2 outline-2 outline-offset-2 outline-transparent transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-input-placeholder focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50',
	variants: {
		variant: {
			default: 'border-muted-light bg-background',
			filled: 'border-transparent bg-muted-light',
			ghost: 'border-transparent',
		},
		inputSize: {
			sm: 'min-h-16 max-w-56 px-2 py-1 text-sm',
			default: 'min-h-20 max-w-60 px-2.5 py-1.5 text-sm',
			lg: 'min-h-24 max-w-80 px-3 py-2 text-base',
			full: 'min-h-32 max-w-full px-2.5 py-1.5 text-sm',
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
 * @name Textarea
 * @description Multiline text field for collecting longer free-form input such as comments, notes, or descriptions.
 * @returns {JSX.Element} The Textarea component.
 */
export function Textarea({
	autoResize,

	inputSize = 'default',
	variant = 'default',
	state = 'default',
	className,

	...props
}: TextareaPropsType): JSX.Element {
	return (
		<textarea
			className={cn(
				textareaVariants({ inputSize, variant, state }),
				autoResize && 'field-sizing-content',
				className,
			)}
			data-slot="textarea"
			aria-invalid={state === 'error' ? true : undefined}
			aria-disabled={props.disabled ? true : undefined}
			aria-readonly={props.readOnly ? true : undefined}
			{...props}
		/>
	);
}
