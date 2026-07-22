import { createElement, JSX } from 'react';

import { ListPropsType } from './list.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Slot } from '../slot';

/** Variants for the List component. */
export const { variants: listVariants, types: ListVariantTypes } = makeVariants({
	base: '',
	variants: {
		variant: {
			ul: `list-disc`,
			ol: `list-decimal`,
		},
	},
	default: {
		variant: 'ul',
	},
});

/**
 * @description A semantic container for ordered or unordered groups of related list items.
 * @returns {JSX.Element} The List component.
 */
export function List({
	as = 'ul',
	asChild,

	className,
	children,

	...props
}: ListPropsType): JSX.Element {
	const componentProps = {
		'data-slot': 'list',
		...props,
		className: cn(listVariants({ variant: as }), className),
	} as const;

	/** If asChild is true, merge props with the child element (no new DOM node). */
	if (asChild) return <Slot {...componentProps}>{children}</Slot>;

	/** Use createElement to create the element dynamically. */
	return createElement(as, componentProps, children);
}
