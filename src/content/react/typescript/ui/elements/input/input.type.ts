import { ComponentPropsWithRef } from 'react';

import { InputVariantTypes } from './Input';

/** Props type for the Input component. */
export type InputPropsType = ComponentPropsWithRef<'input'> & {
	/** Input variant style. Default - default. */
	variant?: typeof InputVariantTypes.variant;

	/** Input size variant. Default - default. */
	inputSize?: typeof InputVariantTypes.inputSize;

	/** Input state. Default - default. */
	state?: typeof InputVariantTypes.state;
};
