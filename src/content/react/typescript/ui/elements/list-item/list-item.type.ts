import { ComponentPropsWithRef } from 'react';

/** Props type for the ListItem component. */
export type ListItemPropsType = ComponentPropsWithRef<'li'> & {
	/** If true, the list item will render its children as a child of the list item element. */
	asChild?: boolean;
};
