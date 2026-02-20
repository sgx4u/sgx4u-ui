import { ReactNode } from 'react';

/** Props for the FocusTrap component. */
export type FocusTrapPropsType = {
	/** Whether focus trap is active. Default - true. */
	active?: boolean;

	/** Whether to return focus to the previously focused element when the focus trap is deactivated. Default - true. Default - true. */
	returnFocusOnDeactivate?: boolean;

	/** Children to trap focus within. */
	children?: ReactNode;
};
