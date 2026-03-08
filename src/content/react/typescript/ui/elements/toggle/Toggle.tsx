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

	/** Controlled + Uncontrolled sync. */
	const isPressed = pressed ?? internalPressed;

	const onToggleChecked = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		if (props.disabled) return;

		onPressedChange?.(!isPressed);
		onClick?.(event);
		if (pressed === undefined) setInternalPressed((prev) => !prev);
	};

	return (
		<Button
			onClick={onToggleChecked}
			variant="ghost"
			size="icon"
			data-slot="toggle"
			data-state={isPressed ? 'on' : 'off'}
			aria-pressed={isPressed}
			aria-label={isPressed ? 'Deactivate toggle' : 'Activate toggle'}
			{...props}
		/>
	);
}
