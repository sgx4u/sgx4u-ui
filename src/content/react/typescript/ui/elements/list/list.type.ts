import { ComponentPropsWithRef } from 'react';

import { ListVariantTypes } from './List';

/** Variants for the List component. */
export type ListVariantType = typeof ListVariantTypes.variant;

/** Props type for the List component. */
export type ListPropsType = {
	/** If true, the list will render its children as a child of the list element. */
	asChild?: boolean;

	/** List variant. Default - ul. */
	as?: ListVariantType;
} & Omit<ComponentPropsWithRef<ListVariantType>, 'children'> & {
		/** List children. */
		children?: ComponentPropsWithRef<ListVariantType>['children'];
	};
