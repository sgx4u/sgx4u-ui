import { ContainerPropsType } from '../container';
import { ButtonGroupVariantTypes } from './ButtonGroup';

/** Props type for the ButtonGroup component. */
export type ButtonGroupPropsType = ContainerPropsType & {
	/** Button group orientation. Default - horizontal. */
	orientation?: typeof ButtonGroupVariantTypes.orientation;
};
