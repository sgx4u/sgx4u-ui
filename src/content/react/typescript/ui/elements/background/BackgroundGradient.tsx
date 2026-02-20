'use client';

import { JSX, useEffect, useState } from 'react';

import { BackgroundGradientPropsType } from './background.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container/Container';

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
 * @name Background Gradient
 * @description Full-viewport background that smoothly cycles through a palette of Tailwind gradient utility classes to create a subtle animated color wash.
 * @returns {JSX.Element} The BackgroundGradient component.
 */
export function BackgroundGradient({
	colors,
	interval = 2000,
	className,

	...props
}: BackgroundGradientPropsType): JSX.Element {
	/** Get the final colors. */
	const finalColors = colors?.length ? colors : defaultColors;

	/** Keep track of the current background color. */
	const [backgroundColorIndex, setBackgroundColorIndex] = useState(0);

	/** Cycle colors every interval. */
	useEffect(() => {
		const rotation = setInterval(() => {
			setBackgroundColorIndex((prev) => (prev + 1) % finalColors.length);
		}, interval);
		return (): void => clearInterval(rotation);
	}, [finalColors.length, interval]);

	if (finalColors.length === 0) return <></>;
	return (
		<Container
			as="div"
			className={cn(
				`flex size-40 items-center justify-center overflow-hidden transition-all duration-1000`,
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
