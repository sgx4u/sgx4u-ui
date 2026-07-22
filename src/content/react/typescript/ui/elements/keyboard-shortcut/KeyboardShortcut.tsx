'use client';

import { JSX } from 'react';

import { KeyboardShortcutPropsType } from './keyboard-shortcut.type';
import { formatShortcut, parseShortcut } from '../../utils/keyboard-shortcut.util';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut.hook';

import { Container } from '../container';

/** Variants for the KeyboardShortcut hint text. */
export const { variants: keyboardShortcutVariants, types: KeyboardShortcutVariantTypes } = makeVariants({
	base: 'ms-auto inline-flex items-center self-center rounded-sm pl-5 font-medium text-muted-foreground',
	variants: {
		size: {
			sm: 'text-xxs',
			default: 'text-xs',
			lg: 'text-sm',
		},
	},
	default: {
		size: 'default',
	},
});

/**
 * @description Invisible helper that turns the nearest actionable wrapper (button, link, dropdown menu item, etc.) it is nested inside into a keyboard shortcut target, and renders a visual key hint next to it. Registration is scoped to this component's mounted lifetime, so shortcuts placed inside overlays that unmount while closed (popovers, dropdown menus, dialogs) are automatically inert until reopened.
 * @returns {JSX.Element} The KeyboardShortcut component.
 */
export function KeyboardShortcut({
	keys,
	onTrigger,
	target,
	disabled = false,
	hidden = false,
	children,

	enableOnFormElements = false,
	preventDefault = true,
	size = 'default',

	ref: refFromProps,
	className,
	...props
}: KeyboardShortcutPropsType): JSX.Element {
	const { ref: shortcutRef } = useKeyboardShortcut({
		keys,
		onTrigger,
		target,
		disabled,
		enableOnFormElements,
		preventDefault,
	});

	/**
	 * @description Merges the internal ref (used to resolve the nearest actionable ancestor) with any ref forwarded from props.
	 * @param {HTMLElement | null} element - The wrapper DOM element.
	 * @returns {void}
	 */
	const setRef = (element: HTMLElement | null): void => {
		shortcutRef(element);
		if (typeof refFromProps === 'function') refFromProps(element as HTMLDivElement);
		else if (refFromProps) refFromProps.current = element as HTMLDivElement;
	};

	/** Keeps the shortcut active without rendering a visible hint. */
	if (hidden) {
		return (
			<Container
				as="span"
				{...props}
				ref={setRef}
				data-slot="keyboard-shortcut"
				aria-hidden="true"
				className="hidden"
			/>
		);
	}

	/** Skips registration and rendering entirely while disabled. */
	if (disabled) return <></>;

	return (
		<Container
			as="span"
			data-slot="keyboard-shortcut"
			{...props}
			ref={setRef}
			aria-hidden="true"
			className={cn(keyboardShortcutVariants({ size }), className)}
		>
			{children ?? formatShortcut(parseShortcut(keys))}
		</Container>
	);
}
