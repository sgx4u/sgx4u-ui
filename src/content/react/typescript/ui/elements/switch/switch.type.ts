import { ContainerPropsType } from '../container';
import { InputPropsType } from '../input';

/** Props type for the Switch component. */
export type SwitchPropsType = Omit<InputPropsType, 'inputSize'> & {
	/** Callback when switch is checked. */
	onCheckedChange?: (checked: boolean) => void;

	/** Switch size variant. Default - default. */
	inputSize?: 'xs' | 'sm' | 'default' | 'lg';

	/** Switch state. Default - default. */
	state?: 'default' | 'error' | 'success' | 'warn';

	/** Switch thumb props. */
	thumbProps?: ContainerPropsType;

	/** Switch container props. */
	containerProps?: ContainerPropsType;
};
