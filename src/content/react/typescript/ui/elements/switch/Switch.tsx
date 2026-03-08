'use client';

import { JSX, KeyboardEvent as ReactKeyboardEvent, useState } from 'react';

import { SwitchPropsType } from './switch.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';
import { Input } from '../input';

/** Variants for the Switch component. */
export const { variants: switchVariants, types: SwitchVariantTypes } = makeVariants({
	base: 'peer min-w-0 cursor-pointer appearance-none rounded-full border-2 border-transparent bg-muted p-0 outline-2 duration-300 checked:bg-primary not-checked:hover:bg-muted-dark',
	variants: {
		size: {
			xs: 'h-4 w-7',
			sm: 'h-5 w-9',
			default: 'h-6 w-11',
			lg: 'h-7 w-14',
		},
		state: {
			default: 'outline-transparent',
			success: 'outline-success',
			warn: 'outline-warn',
			error: 'outline-danger',
		},
	},
	default: {
		size: 'default',
	},
});

/** Variants for the Switch thumb component. */
export const { variants: switchThumbVariants } = makeVariants({
	base: 'pointer-events-none absolute top-0 bottom-0 left-0.5 my-auto rounded-full bg-background transition-all duration-300',
	variants: {
		size: {
			xs: 'size-3 peer-checked:left-3.5',
			sm: 'size-4 peer-checked:left-[18px]',
			default: 'size-5 peer-checked:left-[22px]',
			lg: 'size-6 peer-checked:left-[30px]',
		},
	},
	default: {
		size: 'default',
	},
});

/**
 * @description A two-state toggle used for turning a setting or feature on and off.
 * @returns {JSX.Element} The Switch component.
 */
export function Switch({
	checked,
	defaultChecked,
	onCheckedChange,
	onChange,
	onKeyDown,

	state = 'default',
	inputSize = 'default',
	className,

	thumbProps = {},
	containerProps = {},
	...props
}: SwitchPropsType): JSX.Element {
	/** Internal checked state when checked is not provided. */
	const [isChecked, setIsChecked] = useState(defaultChecked ?? false);

	/** Controlled + Uncontrolled sync. */
	const currentChecked = checked ?? isChecked;

	const handleCheckedChange = (value: boolean): void => {
		if (props.disabled) return;

		onCheckedChange?.(value);
		if (checked === undefined) setIsChecked(value);
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
		if (props.disabled) return;

		onKeyDown?.(event);

		const isEnter = event.key === 'Enter';
		const isSpacebar = event.key === ' ' || event.key === 'Spacebar';
		if (!isEnter && !isSpacebar) return;

		event.preventDefault();
		handleCheckedChange(!currentChecked);
	};

	const { className: thumbClassName, ...thumbRestProps } = thumbProps;
	const { className: containerClassName, ...containerRestProps } = containerProps;

	return (
		<Container as="div" className={cn('relative inline-flex', containerClassName)} {...containerRestProps}>
			<Input
				checked={currentChecked}
				onChange={(event) => {
					onChange?.(event);
					handleCheckedChange(event.target.checked);
				}}
				onKeyDown={handleKeyDown}
				type="checkbox"
				className={cn(switchVariants({ size: inputSize, state }), className)}
				data-slot="switch"
				data-state={state ?? 'default'}
				role="switch"
				aria-checked={currentChecked}
				aria-disabled={props.disabled ?? false}
				{...props}
			/>
			<Container
				as="span"
				className={cn(switchThumbVariants({ size: inputSize }), thumbClassName)}
				{...thumbRestProps}
			/>
		</Container>
	);
}
