'use client';

import { JSX, MouseEvent as ReactMouseEvent, useState } from 'react';

import { TogglePropsType } from './toggle.type';

import { Button } from '../button';

/**
 * @description A pressable control that switches between on and off states, similar to a button with persistent pressed state.
 * @returns {JSX.Element} The Toggle component.
 */
export function Toggle({
	pressed,
	defaultPressed,
	onPressedChange,
	onClick,

	...props
}: TogglePropsType): JSX.Element {
	/** Internal pressed state when pressed is not provided. */
	const [internalPressed, setInternalPressed] = useState(defaultPressed ?? false);

	/** Resolve controlled or uncontrolled pressed state. */
	const isPressed = pressed ?? internalPressed;

	/**
	 * @description Toggles the pressed state, notifies listeners, and forwards the original click event.
	 * @param {ReactMouseEvent<HTMLButtonElement>} event - The click event on the toggle button.
	 * @returns {void}
	 */
	const handleToggle = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		if (props.disabled) return;

		onPressedChange?.(!isPressed);
		onClick?.(event);
		if (pressed === undefined) setInternalPressed((previousPressed) => !previousPressed);
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			{...props}
			onClick={handleToggle}
			data-slot="toggle"
			data-state={isPressed ? 'on' : 'off'}
			aria-pressed={isPressed}
		/>
	);
}
