import { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { LucideProps } from 'lucide-react';

/** Props type for the Icons component. */
export type IconsPropsType = {
	/** Variant of the icons. */
	variant: 'password-show-hide';
} & PasswordShowHideIconPropsType;

/** Props type for the PasswordShowHideIcon component. */
export type PasswordShowHideIconPropsType = LucideProps & {
	/** Whether password is visible. */
	visible?: boolean;

	/** Whether password is default visible. */
	defaultVisible?: boolean;

	/** Callback when password visibility is toggled. */
	onVisibleChange?: (visible: boolean) => void;

	/** Callback when key down is triggered. */
	onKeyDown?: (event: ReactKeyboardEvent<SVGSVGElement>) => void;
};
