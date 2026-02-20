import { ReactElement } from 'react';

/** Props type for the ClickAwayListener component. */
export type ClickAwayListenerPropsType = {
	/** Whether the click away listener is active. */
	active?: boolean;

	/** On click away callback. */
	onClickAway?: () => void;

	/** Click away listener children. */
	children?: ReactElement;
};
