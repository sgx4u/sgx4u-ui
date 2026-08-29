'use client';

import { JSX, KeyboardEvent as ReactKeyboardEvent } from 'react';

import { LinkPropsType } from './link.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { buttonVariants } from '../button/Button';
import { Slot } from '../slot';
import { AdoptiveLink } from './AdoptiveLink';

/** Variants for the ActiveLink component. */
export const { variants: activeLinkVariants, types: ActiveLinkVariantTypes } = makeVariants({
	variants: {
		activeVariant: {
			default: 'bg-primary-light px-1 font-semibold text-primary',
			dotted: 'relative font-semibold after:absolute after:size-1.5 after:rounded-full after:bg-primary',
			line: 'relative font-semibold after:absolute after:mx-auto after:rounded-full after:bg-primary',
			none: '',
		},
		activeIndicatorPosition: {
			top: '',
			right: '',
			bottom: '',
			left: '',
		},
	},
	conditionals: [
		{
			when: { activeVariant: 'dotted', activeIndicatorPosition: 'top' },
			apply: 'after:inset-[-8px_0_auto_0] after:mx-auto',
		},
		{
			when: { activeVariant: 'dotted', activeIndicatorPosition: 'right' },
			apply: 'after:inset-[0_-15px_0_auto] after:my-auto',
		},
		{
			when: { activeVariant: 'dotted', activeIndicatorPosition: 'bottom' },
			apply: 'after:inset-[auto_0_-8px_0] after:mx-auto',
		},
		{
			when: { activeVariant: 'dotted', activeIndicatorPosition: 'left' },
			apply: 'after:inset-[0_auto_0_-15px] after:my-auto',
		},
		{
			when: { activeVariant: 'line', activeIndicatorPosition: 'top' },
			apply: 'after:inset-[-6px_0_auto_0] after:mx-auto after:h-0.5 after:w-6',
		},
		{
			when: { activeVariant: 'line', activeIndicatorPosition: 'right' },
			apply: 'after:inset-[0_-15px_0_auto] after:my-auto after:h-6 after:w-0.5',
		},
		{
			when: { activeVariant: 'line', activeIndicatorPosition: 'bottom' },
			apply: 'after:inset-[auto_0_-6px_0] after:mx-auto after:h-0.5 after:w-6',
		},
		{
			when: { activeVariant: 'line', activeIndicatorPosition: 'left' },
			apply: 'after:inset-[0_auto_0_-15px] after:my-auto after:h-6 after:w-0.5',
		},
	],
	default: {
		activeVariant: 'default',
	},
});

/**
 * @description A navigational element that takes users to another page, view, or section when activated.
 * @returns {JSX.Element} The Link component.
 */
export function Link({
	asChild,
	onClick,
	onKeyDown,
	active,
	activeVariant = 'default',
	activeIndicatorPosition = 'bottom',
	disabled,

	variant = 'link',
	size = 'link',
	className,

	children,
	...props
}: LinkPropsType): JSX.Element {
	const isAriaLabelNeeded = !children || typeof children !== 'string';

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLAnchorElement>): void => {
		if (disabled) return;

		onKeyDown?.(event);

		const isEnter = event.key === 'Enter';
		const isSpacebar = event.key === ' ' || event.key === 'Spacebar';
		if (!isEnter && !isSpacebar) return;

		event.preventDefault();
		event.currentTarget.click();
	};

	const componentProps = {
		'data-slot': 'link',
		...props,
		onClick,
		onKeyDown: handleKeyDown,
		className: cn(
			disabled && 'pointer-events-none opacity-50',
			buttonVariants({ variant, size }),
			active && activeLinkVariants({ activeVariant, activeIndicatorPosition }),
			className,
		),
		'data-active': active ? 'true' : 'false',
		rel: props.rel ?? (props.target === '_blank' ? 'noopener noreferrer' : undefined),
		'aria-label': props['aria-label'] ?? (isAriaLabelNeeded ? props.title : undefined),
		'aria-current': active ? 'page' : undefined,
		'aria-disabled': disabled ? true : undefined,
		tabIndex: disabled ? -1 : props.tabIndex,
	} as const;

	/** If asChild is true, merge props with the child element (no new DOM node). */
	if (asChild) return <Slot {...componentProps}>{children}</Slot>;

	return <AdoptiveLink {...componentProps}>{children}</AdoptiveLink>;
}
