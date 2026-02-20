import { ButtonPropsType } from '../button';

/** Props type for the Toggle component. */
export type TogglePropsType = ButtonPropsType & {
	/** Whether the toggle is pressed. */
	pressed?: boolean;

	/** Whether the toggle is default pressed. */
	defaultPressed?: boolean;

	/** Callback when the pressed state changes. */
	onPressedChange?: (pressed: boolean) => void;
};
