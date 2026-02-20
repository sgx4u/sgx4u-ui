import { ComponentPropsWithRef } from 'react';

/** Props type for the Input component. */
export type InputPropsType = ComponentPropsWithRef<'input'> & {
	/** Input variant style. Default - default. */
	variant?: 'default' | 'filled' | 'ghost';

	/** Input size variant. Default - default. */
	inputSize?: 'sm' | 'default' | 'lg' | 'full';

	/** Input state. Default - default. */
	state?: 'default' | 'error' | 'success' | 'warn';
};
