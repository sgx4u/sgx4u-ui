'use client';

import { JSX, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, useId, useState } from 'react';

import { RadioPropsType } from './radio.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';
import { Input } from '../input';
import { Label } from '../label';

/** Variants for the Radio component. */
export const { variants: radioVariants, types: RadioVariantTypes } = makeVariants({
	base: 'outline-2 outline-offset-2',
	variants: {
		variant: {
			default: `relative inline-block cursor-pointer rounded-full before:absolute before:inset-0 before:rounded-full before:border-2 before:border-muted before:bg-background before:transition-all peer-checked:before:border-primary after:absolute after:scale-0 after:rounded-full after:bg-primary after:opacity-0 after:transition-all peer-checked:after:scale-100 peer-checked:after:opacity-100`,
			card: 'min-h-10 min-w-10 cursor-pointer rounded-lg border-2 bg-background transition-all peer-checked:border-muted peer-checked:bg-muted peer-not-checked:hover:bg-muted-light',
		},
		state: {
			default: 'outline-transparent focus-visible:outline-primary',
			danger: 'outline-danger',
			success: 'outline-success',
			warn: 'outline-warn',
		},
		size: {
			sm: '',
			default: '',
			lg: '',
		},
	},
	conditionals: [
		{
			when: { variant: 'card', size: 'sm' },
			apply: 'size-8',
		},
		{
			when: { variant: 'card', size: 'default' },
			apply: 'size-10',
		},
		{
			when: { variant: 'card', size: 'lg' },
			apply: 'size-12',
		},
		{
			when: { variant: 'default', size: 'sm' },
			apply: 'size-5 before:size-5 after:top-1 after:left-1 after:size-3',
		},
		{
			when: { variant: 'default', size: 'default' },
			apply: 'size-6 before:size-6 after:top-1.25 after:left-1.25 after:size-3.5',
		},
		{
			when: { variant: 'default', size: 'lg' },
			apply: 'size-7 before:size-7 after:top-1.25 after:left-1.25 after:size-4.5',
		},
	],
	default: {
		variant: 'default',
		size: 'default',
		state: 'default',
	},
});

/**
 * @description Single-selection form control typically used in groups where only one option can be active at a time.
 * @returns {JSX.Element} The Radio component.
 */
export function Radio({
	id,
	checked,
	defaultChecked,
	onCheckedChange,
	onClick,
	onKeyDown,

	variant = 'default',
	size = 'default',
	state = 'default',
	className,

	inputProps = {},
	containerProps = {},
	...props
}: RadioPropsType): JSX.Element {
	/** Internal checked state when checked is not provided. */
	const [isChecked, setIsChecked] = useState(defaultChecked ?? false);

	/** Controlled + Uncontrolled sync. */
	const currentChecked = checked ?? isChecked;

	/** Generate a default id that will be used if id is not provided. */
	const defaultId = useId();
	/** Unique identifier to identify the radio element. */
	const radioUid = id ?? defaultId;

	/** Toggle the checked state and notify listeners. */
	const toggleChecked = (): void => {
		const nextChecked = !currentChecked;
		onCheckedChange?.(nextChecked);
		if (checked === undefined) setIsChecked(nextChecked);
	};

	/**
	 * @description Toggles selection on click and forwards the original click event.
	 * @param {ReactMouseEvent<HTMLLabelElement>} event - The click event on the radio label.
	 * @returns {void}
	 */
	const handleClick = (event: ReactMouseEvent<HTMLLabelElement>): void => {
		if (props.disabled) return;

		onClick?.(event);
		toggleChecked();
	};

	/**
	 * @description Toggles selection on Space or Enter and forwards the original keydown event.
	 * @param {ReactKeyboardEvent<HTMLLabelElement>} event - The keydown event on the radio label.
	 * @returns {void}
	 */
	const handleKeyDown = (event: ReactKeyboardEvent<HTMLLabelElement>): void => {
		if (props.disabled) return;

		onKeyDown?.(event);

		const isEnter = event.key === 'Enter';
		const isSpacebar = event.key === ' ' || event.key === 'Spacebar';
		if (!isEnter && !isSpacebar) return;

		event.preventDefault();
		toggleChecked();
	};

	return (
		<Container {...containerProps} className={cn('inline-flex', containerProps.className)}>
			<Input
				{...inputProps}
				name={inputProps.name ?? 'radio'}
				id={radioUid}
				type="radio"
				checked={currentChecked}
				onChange={() => {}}
				className={cn(inputProps.className, 'peer hidden')}
			/>
			<Label
				{...props}
				htmlFor={radioUid}
				className={cn(radioVariants({ variant, size, state }), className)}
				role="radio"
				tabIndex={props.disabled ? undefined : 0}
				aria-checked={currentChecked}
				aria-disabled={props.disabled ? true : undefined}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
			/>
		</Container>
	);
}
