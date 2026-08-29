'use client';

import { JSX, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, useRef, useState } from 'react';

import { SliderPropsType } from './slider.type';
import { cn } from '../../utils/styles.util';
import { clampToStep, getValueFromPointerPosition } from './slider.helper';

import { Container } from '../container';

/**
 * @description Normalizes a slider value into a tuple for uniform rendering, regardless of single or range mode.
 * @param {number | [number, number]} value - The raw slider value.
 * @returns {[number, number] | [number]} A tuple of one (single) or two (range) values.
 */
function toThumbValues(value: number | [number, number]): Array<number> {
	return Array.isArray(value) ? value : [value];
}

/**
 * @description Pointer and keyboard accessible slider for selecting a single value or a range along a track.
 * @returns {JSX.Element} The Slider component.
 */
export function Slider({
	value,
	defaultValue,
	onValueChange,
	onValueCommit,

	min = 0,
	max = 100,
	step = 1,
	orientation = 'horizontal',
	disabled,
	className,

	'aria-label': ariaLabel,
	...props
}: SliderPropsType): JSX.Element {
	const [internalValue, setInternalValue] = useState<number | [number, number]>(defaultValue ?? min);

	const trackRef = useRef<HTMLDivElement | null>(null);
	const activeThumbIndexRef = useRef<number | null>(null);

	const currentValue = value ?? internalValue;
	const thumbValues = toThumbValues(currentValue);
	const isRange = thumbValues.length === 2;

	const commitValue = (nextValue: number | [number, number]): void => {
		onValueChange?.(nextValue);
		if (value === undefined) setInternalValue(nextValue);
	};

	const updateThumbAt = (index: number, rawValue: number): number | [number, number] => {
		if (!isRange) return rawValue;

		const [low, high] = thumbValues;
		if (index === 0) return [Math.min(rawValue, high), high];
		return [low, Math.max(rawValue, low)];
	};

	const handlePointerMove = (event: PointerEvent): void => {
		const trackElement = trackRef.current;
		if (!trackElement || activeThumbIndexRef.current === null) return;

		const trackRect = trackElement.getBoundingClientRect();
		const rawValue = getValueFromPointerPosition({
			clientPosition: orientation === 'horizontal' ? event.clientX : event.clientY,
			trackRect,
			orientation,
			min,
			max,
			step,
		});

		commitValue(updateThumbAt(activeThumbIndexRef.current, rawValue));
	};

	const handlePointerUp = (): void => {
		activeThumbIndexRef.current = null;
		onValueCommit?.(value ?? internalValue);

		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', handlePointerUp);
	};

	const handleThumbPointerDown =
		(index: number) =>
		(event: ReactPointerEvent<HTMLDivElement>): void => {
			if (disabled) return;
			event.preventDefault();
			activeThumbIndexRef.current = index;

			window.addEventListener('pointermove', handlePointerMove);
			window.addEventListener('pointerup', handlePointerUp);
		};

	const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
		if (disabled) return;
		const trackElement = trackRef.current;
		if (!trackElement) return;

		const trackRect = trackElement.getBoundingClientRect();
		const rawValue = getValueFromPointerPosition({
			clientPosition: orientation === 'horizontal' ? event.clientX : event.clientY,
			trackRect,
			orientation,
			min,
			max,
			step,
		});

		/** For range sliders, drag whichever thumb is closest to the click position. */
		const closestIndex = isRange
			? Math.abs(rawValue - thumbValues[0]) <= Math.abs(rawValue - thumbValues[1])
				? 0
				: 1
			: 0;

		commitValue(updateThumbAt(closestIndex, rawValue));
		handleThumbPointerDown(closestIndex)(event);
	};

	const handleKeyDown =
		(index: number) =>
		(event: ReactKeyboardEvent<HTMLDivElement>): void => {
			if (disabled) return;

			const direction = orientation === 'horizontal' ? 1 : -1;
			let delta = 0;

			if (event.key === 'ArrowRight' || event.key === 'ArrowUp') delta = step * direction;
			else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') delta = -step * direction;
			else if (event.key === 'Home') delta = min - thumbValues[index];
			else if (event.key === 'End') delta = max - thumbValues[index];
			else return;

			event.preventDefault();
			const nextValue = clampToStep({ value: thumbValues[index] + delta, min, max, step });
			const nextState = updateThumbAt(index, nextValue);

			commitValue(nextState);
			onValueCommit?.(nextState);
		};

	const isVertical = orientation === 'vertical';
	const fillPercentages = thumbValues.map((thumbValue) => ((thumbValue - min) / (max - min)) * 100);
	const fillStart = isRange ? Math.min(...fillPercentages) : 0;
	const fillEnd = isRange ? Math.max(...fillPercentages) : fillPercentages[0];

	return (
		<Container
			ref={trackRef}
			onPointerDown={handleTrackPointerDown}
			className={cn(
				'relative flex touch-none items-center rounded-full bg-muted-light',
				isVertical ? 'h-40 w-2 flex-col' : 'h-2 w-full',
				disabled && 'pointer-events-none opacity-50',
				className,
			)}
			data-slot="slider"
			data-orientation={orientation}
			{...props}
		>
			<Container
				style={
					isVertical
						? { bottom: `${fillStart}%`, height: `${fillEnd - fillStart}%` }
						: { left: `${fillStart}%`, width: `${fillEnd - fillStart}%` }
				}
				className={cn('absolute rounded-full bg-primary', isVertical ? 'inset-x-0' : 'inset-y-0')}
				data-slot="slider-range"
			/>

			{thumbValues.map((thumbValue, index) => (
				<Container
					key={index}
					onPointerDown={handleThumbPointerDown(index)}
					onKeyDown={handleKeyDown(index)}
					style={
						isVertical
							? { bottom: `${fillPercentages[index]}%`, transform: 'translate(0, 50%)' }
							: { left: `${fillPercentages[index]}%`, transform: 'translate(-50%, 0)' }
					}
					className="absolute size-4.5 cursor-pointer rounded-full border-2 border-primary bg-background shadow outline-2 outline-offset-2 outline-transparent transition-colors focus-visible:outline-primary"
					data-slot="slider-thumb"
					role="slider"
					tabIndex={disabled ? -1 : 0}
					aria-orientation={orientation}
					aria-valuemin={min}
					aria-valuemax={max}
					aria-valuenow={thumbValue}
					aria-disabled={disabled}
					aria-label={ariaLabel}
				/>
			))}
		</Container>
	);
}
