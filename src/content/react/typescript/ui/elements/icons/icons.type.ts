import { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { LucideProps } from 'lucide-react';

/** Props type for the Icons component. */
export type IconsPropsType =
	| ({ variant: 'password-show-hide' } & PasswordShowHideIconPropsType)
	| ({ variant: 'arrow' } & ArrowIconPropsType);

/** Visual style of a directional arrow icon. */
export type ArrowIconStyleType = 'chevron' | 'chevrons' | 'arrow' | 'arrow-big' | 'move';

/** Direction a directional arrow icon points in, rendered by rotating the style's "up" icon. */
export type ArrowIconDirectionType =
	| 'up'
	| 'up-right'
	| 'right'
	| 'down-right'
	| 'down'
	| 'down-left'
	| 'left'
	| 'up-left';

/** Props type for the ArrowIcon component. */
export type ArrowIconPropsType = LucideProps & {
	/** Visual style of the arrow. Default - "arrow". */
	arrowStyle?: ArrowIconStyleType;

	/** Direction the arrow points in. */
	direction: ArrowIconDirectionType;
};

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
