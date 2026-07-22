import { ContainerPropsType } from '../container';
import { InputPropsType } from '../input';
import { LabelPropsType } from '../label';
import { RadioVariantTypes } from './Radio';

/** Props type for the Radio component. */
export type RadioPropsType = Omit<LabelPropsType, 'variant'> & {
	/** Whether radio is checked. */
	checked?: boolean;

	/** Whether radio is default checked. */
	defaultChecked?: boolean;

	/** Radio on checked change callback. */
	onCheckedChange?: (checked: boolean) => void;

	/** Radio variant style. Default - default. */
	variant?: typeof RadioVariantTypes.variant;

	/** Radio size variant. Default - default. */
	size?: typeof RadioVariantTypes.size;

	/** Radio state. Default - default. */
	state?: typeof RadioVariantTypes.state;

	/** Radio input props. */
	inputProps?: Partial<InputPropsType>;

	/** Radio container props. */
	containerProps?: ContainerPropsType;
};
