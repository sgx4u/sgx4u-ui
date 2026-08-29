'use client';

import { JSX, useEffect, useState } from 'react';

import { BackgroundGradientPropsType } from './background.type';
import { cn } from '../../utils/styles.util';

import { useReducedMotion } from '../../hooks/useReducedMotion.hook';

import { Container } from '../container/Container';

/** Default palette cycled through when no colors are provided. */
const defaultColors = [
	'bg-pink-500/20',
	'bg-blue-500/20',
	'bg-green-500/20',
	'bg-yellow-500/20',
	'bg-pink-400/20',
	'bg-blue-400/20',
	'bg-green-400/20',
	'bg-yellow-400/20',
	'bg-pink-300/20',
	'bg-blue-300/20',
	'bg-green-300/20',
	'bg-yellow-300/20',
];

/**
 * @description Full-viewport background that smoothly cycles through a palette of Tailwind gradient utility classes to create a subtle animated color wash.
 * @returns {JSX.Element} The BackgroundGradient component.
 */
export function BackgroundGradient({
	colors,
	interval = 2000,
	className,

	...props
}: BackgroundGradientPropsType): JSX.Element {
	const finalColors = colors?.length ? colors : defaultColors;

	/** Respect the user's reduced-motion preference (WCAG 2.3.3). */
	const prefersReducedMotion = useReducedMotion();

	const [backgroundColorIndex, setBackgroundColorIndex] = useState(0);

	/** Cycle colors every interval while motion is allowed. */
	useEffect(() => {
		if (prefersReducedMotion) return;

		const rotation = setInterval(() => {
			setBackgroundColorIndex((prev) => (prev + 1) % finalColors.length);
		}, interval);
		return (): void => clearInterval(rotation);
	}, [finalColors.length, interval, prefersReducedMotion]);

	if (finalColors.length === 0) return <></>;
	return (
		<Container
			className={cn(
				`flex size-40 items-center justify-center overflow-hidden transition-colors duration-1000`,
				finalColors[backgroundColorIndex],
				className,
			)}
			data-slot="background-gradient"
			role="presentation"
			aria-hidden="true"
			{...props}
		/>
	);
}
