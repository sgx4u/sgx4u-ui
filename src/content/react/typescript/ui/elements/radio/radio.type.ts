import { ContainerPropsType } from '../container';
import { InputPropsType } from '../input';
import { LabelPropsType } from '../label';

/** Props type for the Radio component. */
export type RadioPropsType = Omit<LabelPropsType, 'variant'> & {
	/** Whether radio is checked. */
	checked?: boolean;

	/** Whether radio is default checked. */
	defaultChecked?: boolean;

	/** Radio on checked change callback. */
	onCheckedChange?: (checked: boolean) => void;

	/** Radio variant style. Default - default. */
	variant?: 'default' | 'card';

	/** Radio size variant. Default - default. */
	size?: 'sm' | 'default' | 'lg';

	/** Radio state. */
	state?: 'default' | 'error' | 'success' | 'warn';

	/** Radio input props. */
	inputProps?: Partial<InputPropsType>;

	/** Radio container props. */
	containerProps?: ContainerPropsType;
};
