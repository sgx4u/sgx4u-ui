import { ComponentPropsWithRef } from 'react';

/** Props type for the Textarea component. */
export type TextareaPropsType = ComponentPropsWithRef<'textarea'> & {
	/** Auto resize the textarea based on content. */
	autoResize?: boolean;

	/** Textarea size variant. Default - default. */
	inputSize?: 'sm' | 'default' | 'lg' | 'full';

	/** Textarea variant style. Default - default. */
	variant?: 'default' | 'filled' | 'ghost';

	/** Textarea state. Default - default. */
	state?: 'default' | 'error' | 'success' | 'warn';
};
