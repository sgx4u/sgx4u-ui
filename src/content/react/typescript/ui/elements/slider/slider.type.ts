import { ContainerPropsType } from '../container';

/** Slider orientation. */
export type SliderOrientationType = 'horizontal' | 'vertical';

/** Slider props type. */
export type SliderPropsType = Omit<ContainerPropsType, 'as' | 'onChange' | 'value' | 'defaultValue'> & {
	/** Controlled value. Pass a tuple for a range slider. */
	value?: number | [number, number];

	/** Initial value for uncontrolled usage. Default - min. */
	defaultValue?: number | [number, number];

	/** Callback invoked continuously while dragging or using the keyboard. */
	onValueChange?: (value: number | [number, number]) => void;

	/** Callback invoked once dragging ends or the keyboard interaction settles. */
	onValueCommit?: (value: number | [number, number]) => void;

	/** Minimum value. Default - 0. */
	min?: number;

	/** Maximum value. Default - 100. */
	max?: number;

	/** Step increment. Default - 1. */
	step?: number;

	/** Orientation of the track. Default - horizontal. */
	orientation?: SliderOrientationType;

	/** Disables pointer and keyboard interaction. */
	disabled?: boolean;

	/** Accessible label used when no visible label is associated with the slider. */
	'aria-label'?: string;
};
