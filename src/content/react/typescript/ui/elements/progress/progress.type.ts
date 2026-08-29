import { ContainerPropsType } from '../container';
import { ProgressVariantTypes } from './Progress';

/** Progress props type. */
export type ProgressPropsType = Omit<ContainerPropsType, 'as' | 'role'> & {
	/** Current progress value. Ignored when indeterminate is true. Default - 0. */
	value?: number;

	/** Maximum progress value. Default - 100. */
	max?: number;

	/** Renders an animated indeterminate bar instead of a fixed value. */
	indeterminate?: boolean;

	/** Size of the progress track. Default - default. */
	size?: typeof ProgressVariantTypes.size;

	/** Visual style of the progress fill. Default - default. */
	variant?: typeof ProgressVariantTypes.variant;

	/** Additional props applied to the fill bar. */
	fillProps?: ContainerPropsType;
};
