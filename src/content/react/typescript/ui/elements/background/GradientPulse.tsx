'use client';

import { JSX, useEffect, useState } from 'react';

import { GradientPulsePropsType } from './background.type';
import { cn } from '../../utils/styles.util';

import { useReducedMotion } from '../../hooks/useReducedMotion.hook';

import { Container } from '../container/Container';

/** Default color sets each pulse circle cycles through when none are provided. */
const defaultItemColors = [
	['bg-pink-500/20', 'bg-red-400/20', 'bg-green-300/20'],
	['bg-blue-500/20', 'bg-blue-400/20', 'bg-blue-300/20'],
	['bg-green-500/20', 'bg-green-400/20', 'bg-green-300/20'],
	['bg-yellow-500/20', 'bg-yellow-400/20', 'bg-yellow-300/20'],
];

/** Default screen positions for each pulse circle when none are provided. */
const defaultItemPositions = ['top-1/4 left-1/4', 'bottom-1/4 right-1/4', 'top-1/3 right-1/4', 'bottom-1/3 left-1/4'];

/**
 * @description Animated background helper that cycles blurred radial gradients across configured positions and color sets to create a soft pulsing glow effect.
 * @returns {JSX.Element} The GradientPulse component.
 */
export function GradientPulse({
	itemColors,
	itemPositions,
	interval = 2000,

	pulseCircleProps,

	className,

	...props
}: GradientPulsePropsType): JSX.Element {
	const finalItemColors = itemColors?.length ? itemColors : defaultItemColors;
	const finalItemPositions = itemPositions?.length ? itemPositions : defaultItemPositions;
	/** Clamp circles to the smallest configured length to avoid out-of-range access. */
	const circleCount = Math.min(finalItemColors.length, finalItemPositions.length);

	/** Respect the user's reduced-motion preference (WCAG 2.3.3). */
	const prefersReducedMotion = useReducedMotion();

	/** Keep track of which color index is currently active for each color set. */
	const [colorIndices, setColorIndices] = useState<Array<number>>(() => Array(circleCount).fill(0));

	/** Cycle colors every interval while motion is allowed. */
	useEffect(() => {
		if (prefersReducedMotion) return;

		const rotation = setInterval(() => {
			setColorIndices((prev) => prev.map((value, index) => (value + 1) % finalItemColors[index].length));
		}, interval);
		return (): void => clearInterval(rotation);
	}, [finalItemColors, interval, prefersReducedMotion]);

	const {
		className: pulseCircleClassName,
		style: pulseCircleStyle,
		...pulseCircleRestProps
	} = pulseCircleProps ?? {};

	if (circleCount === 0) return <></>;
	return (
		<Container
			className={cn('relative size-full overflow-hidden', className)}
			data-slot="gradient-pulse"
			role="presentation"
			aria-hidden="true"
			{...props}
		>
			{finalItemPositions.slice(0, circleCount).map((positionClassName, index) => {
				const palette = finalItemColors[index] ?? [];
				const colorIndex = colorIndices[index] ?? 0;
				const activeColorClassName = palette[colorIndex] ?? '';

				return (
					<Container
						key={index}
						as="span"
						style={{ animationDelay: `${index * 0.5}s`, ...pulseCircleStyle }}
						className={cn(
							`absolute size-96 rounded-full blur-3xl transition-colors duration-1000`,
							!prefersReducedMotion && 'animate-pulse',
							positionClassName,
							activeColorClassName,
							pulseCircleClassName,
						)}
						role="presentation"
						aria-hidden="true"
						{...pulseCircleRestProps}
					/>
				);
			})}
		</Container>
	);
}
