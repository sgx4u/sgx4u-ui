import { ContainerPropsType } from '../container';
import { BackdropVariantTypes } from './Backdrop';

/** Props type for the Backdrop component. */
export type BackdropPropsType = ContainerPropsType & {
	/** Backdrop visibility state. */
	visible: boolean;

	/** Callback invoked when the visibility of the backdrop changes. */
	onVisibilityChange?: (visible: boolean) => void;

	/** Whether the backdrop is dismissible. Default - true. */
	closeOnClick?: boolean;

	/** Whether pressing Escape dismisses the backdrop. Default - true. */
	closeOnEscape?: boolean;

	/** Visual style of the backdrop. Default - dark. */
	variant?: typeof BackdropVariantTypes.variant;

	/** Transition duration in milliseconds. Default - 150. */
	duration?: number;
};
