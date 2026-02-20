import { ComponentPropsWithRef, ElementType } from 'react';

/** Variants for the Text Style component. */
export type TextStyleVariant =
	| 'bold'
	| 'italic'
	| 'underline'
	| 'strikethrough'
	| 'strong'
	| 'mark'
	| 'small'
	| 'subscript'
	| 'superscript'
	| 'delete'
	| 'insert'
	| 'emphasize';

/** Props type for the Text Style component. */
export type TextStylePropsType<E extends ElementType = 'b'> = {
	/** If true, the container will render its children as a child of the container element. */
	asChild?: boolean;

	/** Text style variant. Default - bold. */
	as?: TextStyleVariant;
} & Omit<ComponentPropsWithRef<E>, 'as'>;
