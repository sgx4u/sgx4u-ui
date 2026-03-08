'use client';

import { JSX, KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { PasswordShowHideIconPropsType } from './icons.type';
import { cn } from '../../utils/styles.util';
import { iconsOnKeyDownHelper } from './icons-keydown.helper';

/**
 * @description Stateful eye icon that toggles password visibility.
 * @returns {JSX.Element} The PasswordShowHideIcon component.
 */
export function PasswordShowHideIcon({
	visible,
	defaultVisible,
	onVisibleChange,
	onKeyDown,

	className,
	...props
}: PasswordShowHideIconPropsType): JSX.Element {
	/** Internal state for the visibility of the password when visible is not provided. */
	const [isPasswordVisible, setIsPasswordVisible] = useState(defaultVisible ?? false);

	/** Reference to the icon element. */
	const iconElementRef = useRef<SVGSVGElement | null>(null);
	/** Track if focus should be restored after toggle. */
	const shouldRestoreFocusRef = useRef(false);

	/** Controlled + Uncontrolled sync. */
	const currentVisible = visible ?? isPasswordVisible;

	const toggleVisibility = (): void => {
		const nextVisible = !currentVisible;
		onVisibleChange?.(nextVisible);
		if (visible === undefined) setIsPasswordVisible(nextVisible);
	};

	const handleKeyDown = (event: ReactKeyboardEvent<SVGSVGElement>): void => {
		onKeyDown?.(event);

		/** Check if the element currently has focus. */
		shouldRestoreFocusRef.current = document.activeElement === event.currentTarget;
		iconsOnKeyDownHelper({ event, toggleVisibility });
	};

	/** Restore focus after state change if it was previously focused. */
	useEffect(() => {
		if (!shouldRestoreFocusRef.current) return;

		iconElementRef.current?.focus();
		shouldRestoreFocusRef.current = false;
	}, [currentVisible]);

	return currentVisible ? (
		/** Hide password icon. */
		<EyeIcon
			ref={iconElementRef}
			onClick={toggleVisibility}
			onKeyDown={handleKeyDown}
			className={cn(
				`cursor-pointer rounded-sm text-muted-foreground outline-2 outline-offset-2 outline-transparent focus-visible:outline-primary aria-invalid:outline-danger/25`,
				className,
			)}
			data-slot="password-show-icon"
			role="button"
			tabIndex={0}
			aria-pressed="true"
			aria-label="Hide password"
			{...props}
		/>
	) : (
		/** Show password icon. */
		<EyeOffIcon
			ref={iconElementRef}
			onClick={toggleVisibility}
			onKeyDown={handleKeyDown}
			className={cn(
				`cursor-pointer rounded-sm text-muted-foreground outline-2 outline-offset-2 outline-transparent focus-visible:outline-primary aria-invalid:outline-danger/25`,
				className,
			)}
			data-slot="password-hide-icon"
			role="button"
			tabIndex={0}
			aria-pressed="false"
			aria-label="Show password"
			{...props}
		/>
	);
}
