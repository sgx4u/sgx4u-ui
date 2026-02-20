'use client';

import { JSX, KeyboardEvent as ReactKeyboardEvent, useState } from 'react';

import { CheckboxPropsType } from './checkbox.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';
import { Input } from '../input';

/** Checkbox variants. */
export const { variants: checkboxVariants, types: CheckboxVariantTypes } = makeVariants({
	base: 'relative flex shrink-0 cursor-pointer border-2 stroke-white outline-2 outline-offset-2 transition-all select-none *:pointer-events-none hover:bg-muted focus-visible:outline-primary has-[input:disabled]:pointer-events-none has-[input:disabled]:opacity-50',
	variants: {
		variant: {
			default: 'has-[input:checked]:border-primary has-[input:checked]:bg-primary',
			success: 'has-[input:checked]:border-success has-[input:checked]:bg-success',
			warn: 'has-[input:checked]:border-warn has-[input:checked]:bg-warn',
			danger: 'has-[input:checked]:border-danger has-[input:checked]:bg-danger',
		},
		state: {
			default: 'outline-transparent',
			success: 'outline-success',
			warn: 'outline-warn',
			error: 'outline-danger',
		},
		size: {
			sm: 'size-4 rounded-sm',
			default: 'size-5 rounded-md',
			lg: 'size-6 rounded-md',
		},
	},
	default: {
		variant: 'default',
		state: 'default',
		size: 'default',
	},
});

/**
 * @name Checkbox
 * @description A square box that users can check or uncheck to represent boolean choices or multi-select lists.
 * @returns {JSX.Element} The Checkbox component.
 */
export function Checkbox({
	checked,
	defaultChecked,
	onCheckedChange,
	onKeyDown,

	variant = 'default',
	state = 'default',
	size = 'default',
	className,

	containerProps = {},
	iconProps = {},
	...props
}: CheckboxPropsType): JSX.Element {
	/** Internal checked state when checked is not provided. */
	const [isChecked, setIsChecked] = useState(defaultChecked ?? false);

	/** Controlled + Uncontrolled sync. */
	const currentChecked = checked ?? isChecked;

	const onToggleChecked = (): void => {
		if (props.disabled) return;

		const nextChecked = !currentChecked;
		onCheckedChange?.(nextChecked);
		if (checked === undefined) setIsChecked(nextChecked);
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
		if (props.disabled) return;

		onKeyDown?.(event);

		const isEnter = event.key === 'Enter';
		const isSpacebar = event.key === ' ' || event.key === 'Spacebar';
		if (!isEnter && !isSpacebar) return;

		event.preventDefault();
		onToggleChecked();
	};

	const { className: containerClassName, ...containerRestProps } = containerProps;
	const { className: iconClassName, ...iconRestProps } = iconProps;

	return (
		<Container
			id={props.id}
			as="div"
			onClick={onToggleChecked}
			onKeyDown={handleKeyDown}
			className={cn(checkboxVariants({ variant, state, size }), containerClassName, className)}
			data-slot="checkbox"
			data-checked={currentChecked ? '' : undefined}
			data-state={state}
			role="checkbox"
			aria-checked={currentChecked}
			aria-invalid={state === 'error' || undefined}
			aria-disabled={props.disabled}
			aria-label={props.title ?? props.name ?? 'Checkbox'}
			tabIndex={props.disabled ? undefined : 0}
			{...containerRestProps}
		>
			<Input
				id={props.id ? `${props.id}-input` : undefined}
				type="checkbox"
				checked={currentChecked}
				readOnly={true}
				className="absolute opacity-0"
				tabIndex={-1}
				{...props}
			/>

			{/* Checkbox icon. */}
			<svg
				className={cn('absolute inset-0 m-auto size-full fill-none stroke-2 p-0.5', iconClassName)}
				viewBox="0 0 12 10"
				aria-hidden="true"
				focusable="false"
				{...iconRestProps}
			>
				<polyline
					points="1.5 6 4.5 9 10.5 1"
					style={{
						strokeLinecap: 'round',
						strokeDasharray: 16,
						strokeDashoffset: currentChecked ? 0 : 16,
					}}
					className="stroke-inherit transition-all delay-100 duration-300"
				/>
			</svg>
		</Container>
	);
}
