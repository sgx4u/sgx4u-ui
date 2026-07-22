import { ContainerPropsType } from '../container';
import { InputPropsType } from '../input';
import { SwitchVariantTypes } from './Switch';

/** Props type for the Switch component. */
export type SwitchPropsType = Omit<InputPropsType, 'inputSize'> & {
	/** Callback when switch is checked. */
	onCheckedChange?: (checked: boolean) => void;

	/** Switch size variant. Default - default. */
	inputSize?: typeof SwitchVariantTypes.size;

	/** Switch state. Default - default. */
	state?: typeof SwitchVariantTypes.state;

	/** Switch thumb props. */
	thumbProps?: ContainerPropsType;

	/** Switch container props. */
	containerProps?: ContainerPropsType;
};
