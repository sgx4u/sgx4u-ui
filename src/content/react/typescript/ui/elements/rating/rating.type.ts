import { ContainerPropsType } from '../container';
import { RatingVariantTypes } from './Rating';

/** Rating props type. */
export type RatingPropsType = Omit<ContainerPropsType, 'as' | 'onChange' | 'defaultValue'> & {
	/** Controlled rating value. */
	value?: number;

	/** Initial rating value for uncontrolled usage. Default - 0. */
	defaultValue?: number;

	/** Callback invoked when the rating value changes. */
	onValueChange?: (value: number) => void;

	/** Maximum number of icons to display. Default - 5. */
	max?: number;

	/** Smallest selectable increment. Default - 1 (whole icons). Pass 0.5 for half-icon precision. */
	precision?: 1 | 0.5;

	/** Prevents interaction while still displaying the current value. */
	readOnly?: boolean;

	/** Disables interaction and dims the rating. */
	disabled?: boolean;

	/** Size of each icon. Default - default. */
	size?: typeof RatingVariantTypes.size;

	/** Accessible label describing what is being rated. */
	'aria-label'?: string;
};
