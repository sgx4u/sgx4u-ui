import { KeyboardEvent as ReactKeyboardEvent, SVGProps } from 'react';

import { ContainerPropsType } from '../container';
import { InputPropsType } from '../input';

/** Props type for the Checkbox component. */
export type CheckboxPropsType = Omit<InputPropsType, 'size' | 'variant' | 'state' | 'onKeyDown'> & {
	/** Whether checkbox is checked. */
	checked?: boolean;

	/** Whether checkbox is default checked. */
	defaultChecked?: boolean;

	/** Callback when checkbox is checked. */
	onCheckedChange?: (checked: boolean) => void;

	/** Callback when key down is triggered. */
	onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;

	/** Checkbox variant. Default - default. */
	variant?: 'default' | 'success' | 'warn' | 'danger';

	/** Checkbox state. Default - default. */
	state?: 'default' | 'success' | 'warn' | 'error';

	/** Checkbox size variant. Default - default. */
	size?: 'sm' | 'default' | 'lg';

	/** Props to be passed to the container. */
	containerProps?: ContainerPropsType;

	/** Props to be passed to the icon. */
	iconProps?: SVGProps<SVGSVGElement>;
};
