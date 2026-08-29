import { JSX } from 'react';

import { IconsPropsType } from './icons.type';

import { ArrowIcon } from './ArrowIcon';
import { PasswordShowHideIcon } from './PasswordShowHideIcon';

/**
 * @description Small reusable icon components, including controls like the password show/hide toggle and directional arrows.
 * @returns {JSX.Element} The Icons component.
 */
export function Icons(props: IconsPropsType): JSX.Element {
	/** Destructuring per-branch (rather than up front) preserves discriminated union narrowing on the remaining props. */
	if (props.variant === 'password-show-hide') {
		const { variant: _variant, ...passwordShowHideProps } = props;
		return <PasswordShowHideIcon {...passwordShowHideProps} />;
	}

	if (props.variant === 'arrow') {
		const { variant: _variant, ...arrowProps } = props;
		return <ArrowIcon {...arrowProps} />;
	}

	return <></>;
}
