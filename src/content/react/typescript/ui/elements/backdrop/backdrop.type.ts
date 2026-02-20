import { ContainerPropsType } from '../container';

export type BackdropPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Backdrop visibility state. */
	visible: boolean;

	/** Callback invoked when the visibility of the backdrop changes. */
	onVisibilityChange?: (visible: boolean) => void;

	/** Whether the backdrop is dismissible. Default - true. */
	closeOnClick?: boolean;

	/** Visual style of the backdrop. Default - dark. */
	variant?: 'dark' | 'light' | 'transparent';

	/** Transition duration in milliseconds. */
	duration?: number;

	/** HTML element to render as. Default - div. */
	as?: ContainerPropsType['as'];
};
