import { ComponentPropsWithRef } from 'react';

import { InputVariantTypes } from './Input';

/** Props type for the Input component. */
export type InputPropsType = Omit<ComponentPropsWithRef<'input'>, 'name'> & {
	/** Form field name. Required for form association and accessibility. */
	name: string;

	/** Input variant style. Default - default. */
	variant?: typeof InputVariantTypes.variant;

	/** Input size variant. Default - default. */
	inputSize?: typeof InputVariantTypes.inputSize;

	/** Input state. Default - default. */
	state?: typeof InputVariantTypes.state;
};
