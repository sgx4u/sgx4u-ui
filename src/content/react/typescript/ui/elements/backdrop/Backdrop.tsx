'use client';

import { JSX, MouseEvent as ReactMouseEvent, useEffect } from 'react';

import { BackdropPropsType } from './backdrop.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';

export const { variants: backdropVariants, types: BackdropVariantTypes } = makeVariants({
	base: `fixed inset-0 z-overlay flex items-center justify-center transition-all`,
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
 * @param {BackdropPropsType} props - The props for the Backdrop component.
 * @returns {JSX.Element} The Backdrop component.
 */
export function Backdrop({
	visible,
	onClick,
	onVisibilityChange,
	closeOnClick = true,

	variant = 'dark',
	duration = 150,
	className,
	style,

	...props
}: BackdropPropsType): JSX.Element {
	/* Handle the mouse down event on the backdrop. */
	const handleClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
		if (!closeOnClick || event.target !== event.currentTarget) return;
		if (onClick && event) onClick(event);
		onVisibilityChange?.(false);
	};

	useEffect(() => {
		const closeOnEscape = (event: KeyboardEvent): void => {
			if (event.key === 'Escape' && closeOnClick) {
				event.stopPropagation();
				event.preventDefault();
				onVisibilityChange?.(false);
			}
		};

		window.addEventListener('keydown', closeOnEscape);
		return (): void => {
			window.removeEventListener('keydown', closeOnEscape);
		};
	}, [closeOnClick, onVisibilityChange]);

	return (
		<Container
			as="div"
			onClick={handleClick}
			style={{ transitionDuration: `${duration}ms`, ...style }}
			className={cn(
				backdropVariants({ variant }),
				`duration-${duration}`,
				visible ? 'opacity-100' : 'opacity-0',
				className,
			)}
			data-slot={'Backdrop'}
			role="presentation"
			tabIndex={visible ? 0 : undefined}
			aria-live="off"
			inert={!visible}
			{...props}
		/>
	);
}
