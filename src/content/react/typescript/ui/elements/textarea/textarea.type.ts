import { ComponentPropsWithRef } from 'react';

import { TextareaVariantTypes } from './Textarea';

/** Props type for the Textarea component. */
export type TextareaPropsType = ComponentPropsWithRef<'textarea'> & {
	/** Auto resize the textarea based on content. */
	autoResize?: boolean;

	/** Textarea size variant. Default - default. */
	inputSize?: typeof TextareaVariantTypes.inputSize;

	/** Textarea variant style. Default - default. */
	variant?: typeof TextareaVariantTypes.variant;

	/** Textarea state. Default - default. */
	state?: typeof TextareaVariantTypes.state;
};
