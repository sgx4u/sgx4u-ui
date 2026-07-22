import { ComponentPropsWithoutRef, ElementType, Ref } from 'react';

import { TextVariantTypes } from './Text';

/** Props type for the Text component. */
export type TextPropsType<E extends ElementType = 'body'> = {
	/** Text ref. */
	ref?: Ref<HTMLElement>;

	/** If true, the container will render its children as a child of the container element. */
	asChild?: boolean;

	/** Text variant. Default - undefined. */
	variant?: typeof TextVariantTypes.variant;

	/** Text element to render as. Default - body. */
	as?: typeof TextVariantTypes.as;
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'children'> & {
		/** Text children. */
		children?: ComponentPropsWithoutRef<E>['children'];
	};
