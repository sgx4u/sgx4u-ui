'use client';

import { JSX, useCallback, useEffect, useId, useRef, useState } from 'react';

import { TooltipPropsType } from './tooltip.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';
import { Portal } from '../portal';
import { Slot } from '../slot';
import { Text } from '../text';

/** Tooltip variants. */
export const { variants: tooltipVariants } = makeVariants({
	base: `pointer-events-none fixed z-50 rounded-md border shadow-md transition-opacity before:absolute before:inset-0 before:-z-30 before:rounded-md after:absolute after:-z-40 after:size-5 after:rotate-45 after:rounded-sm after:border data-[state=closed]:opacity-0 data-[state=open]:opacity-100`,
	variants: {
		variant: {
			default: `text-foreground before:bg-background after:border-muted after:bg-background`,
			success: `border-success-dark text-success-dark before:bg-success-light after:border-success-dark after:bg-success-light`,
			warn: `border-warn-dark text-warn-dark before:bg-warn-light after:border-warn-dark after:bg-warn-light`,
			error: `border-danger-dark text-danger-dark before:bg-danger-light after:border-danger-dark after:bg-danger-light`,
			dark: `border-dark text-light before:bg-dark after:border-dark after:bg-dark`,
			light: `border-light text-dark before:bg-light after:border-light after:bg-light`,
		},
		size: {
			sm: 'px-2.5 py-1 text-xs',
			default: 'px-3 py-1.5 text-sm',
			lg: 'px-4 py-2 text-base',
		},
		side: {
			top: 'after:inset-[auto_0_-20%_0] after:mx-auto',
			bottom: 'after:inset-[-20%_0_auto_0] after:mx-auto',
			left: 'after:inset-[0_-3%_0_auto] after:my-auto',
			right: 'after:inset-[0_auto_0_-3%] after:my-auto',
		},
	},
	default: {
		variant: 'default',
		size: 'default',
	},
});

/**
 * @description A brief, non-interactive label that appears on hover or focus to describe another element.
 * @returns {JSX.Element} The Tooltip component.
 */
export function Tooltip({
	asChild,
	content,
	side = 'top',
	trigger = 'hover',
	delay = 100,
	offset,

	open,
	onOpenChange,

	variant = 'default',
	size = 'default',
	children,

	containerProps,
	...props
}: TooltipPropsType): JSX.Element {
	const [isOpen, setIsOpen] = useState(open ?? false);
	const [position, setPosition] = useState({ top: 0, left: 0 });

	/** Timer reference to handle delay. */
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	/** Unique identifier to identify the tooltip element. */
	const tooltipUid = useId();

	/** Effective offset based on side and offset. */
	const effectiveOffset = offset ?? (['top', 'bottom'].includes(side) ? 12 : 15);

	/** Controlled + Uncontrolled sync. */
	const currentOpen = open ?? isOpen;

	const toggleTooltip = (value: boolean): void => {
		onOpenChange?.(value);
		if (open === undefined) setIsOpen(value);
	};

	/**
	 * Compute tooltip position.
	 * The tooltip renders with position:fixed so coordinates are viewport-relative.
	 * getBoundingClientRect() already returns viewport-relative values — no scroll offset needed.
	 */
	const updatePosition = useCallback((): void => {
		const triggerElement = document.querySelector(`[data-slot="tooltip"][data-uid="${tooltipUid}"]`);
		const tooltipElement = document.querySelector(`[data-slot="tooltip-content"][data-uid="${tooltipUid}"]`);
		if (!triggerElement || !tooltipElement) return;

		const { top, bottom, left, right, width, height } = triggerElement.getBoundingClientRect();
		const { width: tipWidth, height: tipHeight } = tooltipElement.getBoundingClientRect();

		let newTop = 0;
		let newLeft = 0;

		switch (side) {
			case 'bottom':
				newTop = bottom + effectiveOffset;
				newLeft = left + width / 2 - tipWidth / 2;
				break;
			case 'left':
				newTop = top + height / 2 - tipHeight / 2;
				newLeft = left - tipWidth - effectiveOffset;
				break;
			case 'right':
				newTop = top + height / 2 - tipHeight / 2;
				newLeft = right + effectiveOffset;
				break;
			default:
				newTop = top - tipHeight - effectiveOffset;
				newLeft = left + width / 2 - tipWidth / 2;
				break;
		}

		setPosition({ top: newTop, left: newLeft });
	}, [side, effectiveOffset, tooltipUid]);

	/** Update position whenever tooltip opens. */
	useEffect(() => {
		if (isOpen) setTimeout(() => updatePosition(), 20);
	}, [isOpen, updatePosition]);

	/** Event handlers based on trigger type. */
	const show = (): void => {
		if (delay) timerRef.current = setTimeout(() => toggleTooltip(true), delay);
		else toggleTooltip(true);
	};

	const hide = (): void => {
		if (timerRef.current) clearTimeout(timerRef.current);
		toggleTooltip(false);
	};

	const { className: containerClassName, ...containerRestProps } = containerProps ?? {};

	const componentProps = {
		as: 'div',
		onMouseEnter: trigger === 'hover' ? show : undefined,
		onMouseLeave: trigger === 'hover' ? hide : undefined,
		onClick: trigger === 'click' ? (): void => toggleTooltip(!currentOpen) : undefined,
		onFocus: trigger === 'focus' ? show : undefined,
		onBlur: trigger === 'focus' ? hide : undefined,
		className: cn('relative inline-block w-max cursor-pointer', containerClassName),
		'data-slot': 'tooltip',
		'data-uid': tooltipUid,
		'aria-describedby': currentOpen ? 'tooltip' : undefined,
		'aria-expanded': currentOpen,
		...containerRestProps,
	} as const;

	if (asChild) return <Slot {...componentProps} />;

	return (
		<Container {...componentProps}>
			{children}
			{/* Always rendered in Portal; data-state drives the opacity transition. aria-hidden hides it from assistive technology when closed. */}
			<Portal>
				<Text
					as="span"
					style={{ top: position.top, left: position.left }}
					className={cn(tooltipVariants({ variant, size, side }))}
					data-slot="tooltip-content"
					data-uid={tooltipUid}
					data-state={currentOpen ? 'open' : 'closed'}
					role="tooltip"
					aria-hidden={!currentOpen}
					{...props}
				>
					{content}
				</Text>
			</Portal>
		</Container>
	);
}
