import { JSX } from 'react';

import { ListItemPropsType } from './list-item.type';

import { Slot } from '../slot';

/**
 * @description A single item inside a list, typically representing one entry in a collection of related content.
 * @returns {JSX.Element} The ListItem component.
 */
export function ListItem({
	asChild,

	className,
	children,

	...props
}: ListItemPropsType): JSX.Element {
	const componentProps = {
		className: className,
		'data-slot': 'list-item',
		...props,
	} as const;

	/** If asChild is true, merge props with the child element (no new DOM node). */
	if (asChild) return <Slot {...componentProps}>{children}</Slot>;

	return <li {...componentProps}>{children}</li>;
}
