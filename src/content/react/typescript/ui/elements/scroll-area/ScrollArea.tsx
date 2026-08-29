'use client';

import { JSX, useEffect, useRef } from 'react';

import { ScrollAreaPropsType } from './scroll-area.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';
import { composeRefs } from '../slot/slot.helper';

import { Container } from '../container';

/** Variants for the ScrollArea viewport. */
export const { variants: scrollAreaVariants, types: ScrollAreaVariantTypes } = makeVariants({
	base: 'size-full overscroll-contain outline-2 -outline-offset-2 outline-transparent [scrollbar-color:var(--color-muted)_transparent] [scrollbar-width:thin] focus-visible:outline-primary',
	variants: {
		orientation: {
			vertical: 'overflow-x-hidden overflow-y-auto',
			horizontal: 'overflow-x-auto overflow-y-hidden',
			both: 'overflow-auto',
		},
	},
	default: {
		orientation: 'vertical',
	},
});

/**
 * @description Scrollable region with a thin, theme-aware scrollbar that preserves native scroll and keyboard behavior.
 * @returns {JSX.Element} The ScrollArea component.
 */
export function ScrollArea({
	orientation = 'vertical',
	className,

	viewportProps,
	children,

	'aria-label': ariaLabel,
	'aria-labelledby': ariaLabelledBy,
	...props
}: ScrollAreaPropsType): JSX.Element {
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const { ref: viewportRefProp, className: viewportClassName, ...restViewportProps } = viewportProps ?? {};

	const hasAccessibleName = Boolean(
		ariaLabel || ariaLabelledBy || restViewportProps['aria-label'] || restViewportProps['aria-labelledby'],
	);

	useEffect(() => {
		const viewportElement = viewportRef.current;
		if (!viewportElement || orientation !== 'horizontal') return;

		const handleWheel = (event: WheelEvent): void => {
			/** Prefer native horizontal gestures (trackpad swipe / shift-wheel deltaX). */
			if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
			if (event.deltaY === 0) return;
			if (viewportElement.scrollWidth <= viewportElement.clientWidth) return;

			event.preventDefault();
			viewportElement.scrollLeft += event.deltaY;
		};

		viewportElement.addEventListener('wheel', handleWheel, { passive: false });
		return (): void => {
			viewportElement.removeEventListener('wheel', handleWheel);
		};
	}, [orientation]);

	return (
		<Container className={cn('relative', className)} data-slot="scroll-area" {...props}>
			<Container
				tabIndex={0}
				role={hasAccessibleName ? 'region' : undefined}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				{...restViewportProps}
				ref={composeRefs(viewportRef, viewportRefProp)}
				className={cn(scrollAreaVariants({ orientation }), viewportClassName)}
				data-slot="scroll-area-viewport"
			>
				{children}
			</Container>
		</Container>
	);
}
