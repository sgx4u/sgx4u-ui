'use client';

import {
	JSX,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent as ReactMouseEvent,
	useEffect,
	useRef,
	useState,
} from 'react';
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
	onClick,
	onKeyDown,
	ref: refFromProps,

	className,
	...props
}: PasswordShowHideIconPropsType): JSX.Element {
	/** Internal state for the visibility of the password when visible is not provided. */
	const [isPasswordVisible, setIsPasswordVisible] = useState(defaultVisible ?? false);

	/** Reference to the icon element. */
	const iconElementRef = useRef<SVGSVGElement | null>(null);

	/** Track if focus should be restored after the icon swaps on toggle. */
	const shouldRestoreFocusRef = useRef(false);

	/** Controlled + Uncontrolled sync. */
	const currentVisible = visible ?? isPasswordVisible;

	/** Toggle visibility, remembering whether the icon had focus so it can be restored after it swaps. */
	const toggleVisibility = (): void => {
		shouldRestoreFocusRef.current = document.activeElement === iconElementRef.current;

		const nextVisible = !currentVisible;
		onVisibleChange?.(nextVisible);
		if (visible === undefined) setIsPasswordVisible(nextVisible);
	};

	/**
	 * Forwards the consumer click handler, then toggles visibility.
	 * @param {ReactMouseEvent<SVGSVGElement>} event - The click event.
	 */
	const handleClick = (event: ReactMouseEvent<SVGSVGElement>): void => {
		onClick?.(event);
		toggleVisibility();
	};

	/**
	 * Forwards the consumer key handler, then toggles visibility on Enter or Space.
	 * @param {ReactKeyboardEvent<SVGSVGElement>} event - The keyboard event.
	 */
	const handleKeyDown = (event: ReactKeyboardEvent<SVGSVGElement>): void => {
		onKeyDown?.(event);
		iconsOnKeyDownHelper({ event, toggleVisibility });
	};

	/**
	 * Merges the internal focus ref with any ref passed from props.
	 * @param {SVGSVGElement | null} element - The icon DOM element.
	 */
	const setRef = (element: SVGSVGElement | null): void => {
		iconElementRef.current = element;
		if (typeof refFromProps === 'function') refFromProps(element);
		else if (refFromProps) refFromProps.current = element;
	};

	/** Restore focus after the icon swaps if it was focused before toggling. */
	useEffect(() => {
		if (!shouldRestoreFocusRef.current) return;

		iconElementRef.current?.focus();
		shouldRestoreFocusRef.current = false;
	}, [currentVisible]);

	/** Show the open eye when the password is visible, otherwise the crossed-out eye. */
	const VisibilityIcon = currentVisible ? EyeIcon : EyeOffIcon;

	return (
		<VisibilityIcon
			ref={setRef}
			{...props}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			className={cn(
				'cursor-pointer rounded-sm text-muted-foreground outline-2 outline-offset-2 outline-transparent focus-visible:outline-primary aria-invalid:outline-danger/25',
				className,
			)}
			data-slot={currentVisible ? 'password-show-icon' : 'password-hide-icon'}
			role="button"
			tabIndex={0}
			aria-pressed={currentVisible}
			aria-label={currentVisible ? 'Hide password' : 'Show password'}
		/>
	);
}
