import { ComponentPropsWithRef } from 'react';

/** Variants for the List component. */
export type ListVariant = 'ul' | 'ol';

/** Props type for the List component. */
export type ListPropsType = {
	/** If true, the list will render its children as a child of the list element. */
	asChild?: boolean;

	/** List variant. Default - ul. */
	as?: ListVariant;
} & Omit<ComponentPropsWithRef<ListVariant>, 'children'> & {
		/** List children. */
		children?: ComponentPropsWithRef<ListVariant>['children'];
	};
