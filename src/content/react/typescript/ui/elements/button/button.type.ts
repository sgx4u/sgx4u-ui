import { ComponentPropsWithRef, ReactNode } from 'react';

import { ButtonVariantTypes } from './Button';

/** Props type for the Button component. */
export type ButtonPropsType = Omit<ComponentPropsWithRef<'button'>, 'type'> & {
	/** If true, the button will render its children as a child of the button element. */
	asChild?: boolean;

	/** Type of the button. Default - button. */
	type?: ComponentPropsWithRef<'button'>['type'];

	/** Is button in loading state. */
	loading?: boolean;

	/** Loader component. Default - SpinLoader. */
	loader?: ReactNode;

	/** Position of the loader. Default - left. */
	loaderPosition?: 'left' | 'right' | 'replace-children';

	/** Visual style of the button. Default - primary. */
	variant?: (typeof ButtonVariantTypes)['variant'];

	/** Size of the button. Default - default. */
	size?: (typeof ButtonVariantTypes)['size'];

	/** Radius of the button. Default - lg. */
	radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
};
