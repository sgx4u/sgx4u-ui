'use client';

import { JSX, MouseEvent as ReactMouseEvent, useEffect } from 'react';

import { BackdropPropsType } from './backdrop.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';

/** Backdrop variants. */
export const { variants: backdropVariants, types: BackdropVariantTypes } = makeVariants({
	base: `fixed inset-0 z-overlay flex items-center justify-center transition-opacity`,
	variants: {
		variant: {
			dark: 'bg-dark/60 backdrop-blur-sm',
			light: 'bg-light/50 backdrop-blur-sm',
			transparent: 'bg-transparent',
		},
	},
	default: {
		variant: 'dark',
	},
});

/**
 * @description Reusable backdrop for overlays (dialogs, drawers, popovers).
 * @returns {JSX.Element} The Backdrop component.
 */
export function Backdrop({
	visible,
	onClick,
	onVisibilityChange,
	closeOnClick = true,
	closeOnEscape = true,

	variant = 'dark',
	duration = 150,
	className,
	style,

	...props
}: BackdropPropsType): JSX.Element {
	/**
	 * @description Dismiss only when the overlay itself is clicked, never its children.
	 * @param {ReactMouseEvent<HTMLDivElement>} event - The click event on the backdrop.
	 */
	const handleClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
		if (event.target !== event.currentTarget) return;

		onClick?.(event);
		if (closeOnClick) onVisibilityChange?.(false);
	};

	/** Dismiss on Escape while the backdrop is visible and Escape dismissal is enabled. */
	useEffect(() => {
		if (!visible || !closeOnClick || !closeOnEscape) return;

		const handleEscape = (event: KeyboardEvent): void => {
			if (event.key !== 'Escape') return;

			event.stopPropagation();
			event.preventDefault();
			onVisibilityChange?.(false);
		};

		window.addEventListener('keydown', handleEscape);
		return (): void => window.removeEventListener('keydown', handleEscape);
	}, [visible, closeOnClick, closeOnEscape, onVisibilityChange]);

	return (
		<Container
			onClick={handleClick}
			style={{ transitionDuration: `${duration}ms`, ...style }}
			className={cn(backdropVariants({ variant }), visible ? 'opacity-100' : 'opacity-0', className)}
			data-slot="backdrop"
			role="presentation"
			inert={!visible}
			{...props}
		/>
	);
}
