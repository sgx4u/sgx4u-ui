import { JSX } from 'react';

import { IconsPropsType } from './icons.type';

import { PasswordShowHideIcon } from './PasswordShowHideIcon';

/**
 * @name Icons
 * @description  Small reusable icon components, including controls like the password show/hide toggle.
 * @returns {JSX.Element} The Icons component.
 */
export function Icons({ variant, ...props }: IconsPropsType): JSX.Element {
	if (variant === 'password-show-hide') return <PasswordShowHideIcon {...props} />;
	return <></>;
}
