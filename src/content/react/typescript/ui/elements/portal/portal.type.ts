import { ReactNode } from 'react';

/** Props type for the Portal component. */
export type PortalPropsType = {
	/** The DOM node to render the children into. Default - document.body. */
	container?: HTMLElement;

	/** Portal children. */
	children?: ReactNode;
};
