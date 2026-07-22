import { ReactElement } from 'react';

/** Props type for the ClickAwayListener component. */
export type ClickAwayListenerPropsType = {
	/** Whether the click away listener is active. */
	active?: boolean;

	/** Whether pressing Escape also triggers the click away callback. Default - true. */
	closeOnEscape?: boolean;

	/** Callback fired when the user interacts outside the child (outside pointer down or Escape). */
	onClickAway?: () => void;

	/** The single element to watch for outside interactions. */
	children: ReactElement;
};
