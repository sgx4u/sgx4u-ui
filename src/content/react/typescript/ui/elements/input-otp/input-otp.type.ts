import { ContainerPropsType } from '../container';
import { InputPropsType } from '../input';

/** Input OTP props type. */
export type InputOTPPropsType = Omit<ContainerPropsType, 'as' | 'onChange' | 'defaultValue'> & {
	/** Form field name. Used as the base name for each character slot, suffixed with its index. */
	name: string;

	/** Number of character slots. Default - 6. */
	length?: number;

	/** Controlled value. */
	value?: string;

	/** Initial value for uncontrolled usage. */
	defaultValue?: string;

	/** Callback invoked whenever the value changes. */
	onChange?: (value: string) => void;

	/** Callback invoked once the value reaches the configured length. */
	onComplete?: (value: string) => void;

	/** Disables all slots. */
	disabled?: boolean;

	/** Visual state applied to every slot. Default - default. */
	state?: InputPropsType['state'];

	/** Accessible label describing the input group. */
	'aria-label'?: string;
};
