import { ReactNode } from 'react';

/** Props type for the Portal component. */
export type PortalPropsType = {
	/** Portal children. */
	children?: ReactNode;

	/** The DOM node to render the children into. Default - document.body. */
	container?: HTMLElement;
};
