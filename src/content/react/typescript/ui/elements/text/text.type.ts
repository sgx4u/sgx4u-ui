import { ComponentPropsWithoutRef, ElementType, Ref } from 'react';

/** Variants for the Text component. */
export type TextVariant =
	| 'display'
	| 'heading'
	| 'subheading'
	| 'title'
	| 'subtitle'
	| 'body'
	| 'body-small'
	| 'tag'
	| 'h1'
	| 'h2'
	| 'h3'
	| 'h4'
	| 'h5'
	| 'h6'
	| 'p'
	| 'span'
	| 'pre'
	| 'code';

/** Props type for the Text component. */
export type TextPropsType<E extends ElementType = 'body'> = {
	/** Text ref. */
	ref?: Ref<HTMLElement>;

	/** If true, the container will render its children as a child of the container element. */
	asChild?: boolean;

	/** Text weight. Default - undefined. */
	weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

	/** Text alignment. Default - undefined. */
	align?: 'left' | 'center' | 'right' | 'justify';

	/** Text truncation. */
	truncate?: boolean;

	/** Text wrapping. Default - true. */
	wrap?: boolean;

	/** Text variant. Default - body. */
	as?: TextVariant;
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'children'> & {
		/** Text children. */
		children?: ComponentPropsWithoutRef<E>['children'];
	};
