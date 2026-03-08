'use client';

import { JSX, KeyboardEvent as ReactKeyboardEvent } from 'react';

import { ButtonPropsType } from './button.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';
import { SpinLoader } from '../loader';
import { Slot } from '../slot';

/** Variants for the Button component. */
export const { variants: buttonVariants, types: ButtonVariantTypes } = makeVariants({
	base: `relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 text-sm font-medium whitespace-nowrap outline-2 outline-offset-2 outline-transparent transition-all focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 aria-invalid:outline-danger/25 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
	variants: {
		variant: {
			primary: `bg-primary text-primary-foreground hover:bg-primary-dark data-[state=on]:bg-primary-dark`,

			'primary-light': `bg-primary-light text-primary hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground dark:text-primary-foreground`,

			'primary-outline': `border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground`,

			secondary: `bg-secondary text-secondary-foreground hover:bg-secondary-dark data-[state=on]:bg-secondary-dark`,

			'secondary-light': `bg-secondary-light text-secondary hover:bg-secondary hover:text-secondary-foreground data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground`,

			'secondary-outline': `border-2 border-secondary bg-background text-secondary hover:bg-secondary hover:text-secondary-foreground data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground`,

			success: `bg-success text-success-foreground hover:bg-success-dark data-[state=on]:bg-success-dark`,

			'success-light': `bg-success-light text-success hover:bg-success hover:text-success-foreground data-[state=on]:bg-success data-[state=on]:text-success-foreground`,

			'success-outline': `border-2 border-success bg-background text-success hover:bg-success hover:text-success-foreground data-[state=on]:bg-success data-[state=on]:text-success-foreground`,

			warn: `bg-warn text-warn-foreground hover:bg-warn-dark data-[state=on]:bg-warn-dark`,

			'warn-light': `bg-warn-light text-warn hover:bg-warn hover:text-warn-foreground data-[state=on]:bg-warn data-[state=on]:text-warn-foreground`,

			'warn-outline': `border-2 border-warn bg-background text-warn hover:bg-warn hover:text-warn-foreground data-[state=on]:bg-warn data-[state=on]:text-warn-foreground`,

			danger: `bg-danger text-danger-foreground hover:bg-danger-dark data-[state=on]:bg-danger-dark`,

			'danger-light': `bg-danger-light text-danger hover:bg-danger hover:text-danger-foreground data-[state=on]:bg-danger data-[state=on]:text-danger-foreground`,

			'danger-outline': `border-2 border-danger bg-background text-danger hover:bg-danger hover:text-danger-foreground data-[state=on]:bg-danger data-[state=on]:text-danger-foreground`,

			muted: `bg-muted text-muted-foreground hover:bg-muted-dark data-[state=on]:bg-muted-dark`,

			'muted-light': `bg-muted-light text-muted-foreground hover:bg-muted hover:text-muted-foreground data-[state=on]:bg-muted data-[state=on]:text-muted-foreground`,

			'muted-outline': `border-2 border-muted bg-background text-muted-foreground hover:bg-muted hover:text-muted-foreground data-[state=on]:bg-muted data-[state=on]:text-muted-foreground`,

			outline: `border-2 bg-background text-muted-foreground hover:bg-muted data-[state=on]:bg-muted`,

			ghost: `hover:bg-muted-light data-[state=on]:bg-muted-light`,

			dark: `bg-dark text-light hover:bg-muted-foreground data-[state=on]:bg-muted-foreground`,

			link: `text-muted-foreground hover:text-primary data-[state=on]:text-primary`,

			wrapper: `cursor-pointer outline-2 outline-offset-2 outline-transparent transition-all focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 aria-invalid:outline-danger/25 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
		},
		size: {
			xs: 'h-7 px-2.5',
			sm: 'h-8 px-3',
			default: 'h-9 px-3',
			lg: 'h-10 px-4',
			xl: 'h-11 px-8',
			icon: 'size-8',
			'icon-sm': 'size-7',
			'icon-lg': 'size-9',
			link: 'h-max w-max',
			wrapper: 'h-max w-max',
		},
		radius: {
			none: 'rounded-none',
			sm: 'rounded-sm',
			md: 'rounded-md',
			lg: 'rounded-lg',
			full: 'rounded-full',
		},
	},
	default: {
		variant: 'primary',
		size: 'default',
		radius: 'lg',
	},
	skipBaseClasses: ['wrapper'],
});

/**
 * @description Pressable control used to trigger actions or events, with support for visual variants, sizes, and loading states.
 * @returns {JSX.Element} The Button component.
 */
export function Button({
	asChild,
	onClick,
	onKeyDown,
	type = 'button',

	loading,
	loader = <SpinLoader />,
	loaderPosition = 'left',

	variant = 'primary',
	size = 'default',
	radius = 'lg',
	className,

	children,
	...props
}: ButtonPropsType): JSX.Element {
	const isDisabled = Boolean(props.disabled) || Boolean(loading);

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		if (isDisabled) return;

		onKeyDown?.(event);

		const isEnter = event.key === 'Enter';
		const isSpacebar = event.key === ' ' || event.key === 'Spacebar';
		if (!isEnter && !isSpacebar) return;

		event.preventDefault();
		event.currentTarget.click();
	};

	const componentProps = {
		onClick,
		onKeyDown: handleKeyDown,
		type,
		disabled: isDisabled,
		className: cn(buttonVariants({ variant, size, radius }), className),
		'data-slot': 'button',
		'data-variant': variant,
		'aria-label': props.title,
		'aria-pressed': props['aria-pressed'],
		'aria-disabled': isDisabled,
		'aria-busy': loading || undefined,
		'aria-live': loading ? 'polite' : undefined,
		'data-loading': loading ? '' : undefined,
		...props,
	} as const;

	/** If asChild is true, merge props with the child element (no new DOM node). */
	if (asChild) return <Slot {...componentProps}>{children}</Slot>;

	return (
		<button {...componentProps}>
			{/* Loader on the left. */}
			{loading && loaderPosition === 'left' && (
				<Container as="span" aria-hidden="true" className="flex">
					{loader}
				</Container>
			)}

			{/* Loader replacing the children. */}
			{loading && loaderPosition === 'replace-children' && (
				<>
					<Container as="span" className="sr-only">
						Loading.
					</Container>
					<Container as="span" className="pointer-events-none absolute opacity-0" aria-hidden="true">
						{children}
					</Container>
					{loader}
				</>
			)}

			{/* Children. */}
			{loaderPosition !== 'replace-children' && children}

			{/* Loader on the right. */}
			{loading && loaderPosition === 'right' && (
				<Container as="span" aria-hidden="true" className="flex">
					{loader}
				</Container>
			)}
		</button>
	);
}
