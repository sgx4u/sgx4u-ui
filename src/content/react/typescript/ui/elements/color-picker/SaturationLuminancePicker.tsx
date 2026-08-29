'use client';

import { JSX, PointerEvent, KeyboardEvent as ReactKeyboardEvent, useMemo, useRef, useState } from 'react';

import { SaturationLuminancePickerPropsType } from './color-picker.type';
import { cn } from '../../utils/styles.util';
import { hsvToRgb } from './color-picker.helper';

import { Container } from '../container';

/**
 * @description 2D saturation/luminance picker. Fires onChange only on mouse/pointer release.
 * @returns {JSX.Element} The SaturationLuminancePicker component.
 */
export function SaturationLuminancePicker({
	hue,
	saturation,
	luminance,
	onChange,
	removeTopPadding = false,
}: SaturationLuminancePickerPropsType): JSX.Element {
	const [isDragging, setIsDragging] = useState(false);
	const [dragSaturation, setDragSaturation] = useState(saturation);
	const [dragLuminance, setDragLuminance] = useState(luminance);

	const containerReference = useRef<HTMLDivElement>(null);

	const displaySaturation = isDragging ? dragSaturation : saturation;
	const displayLuminance = isDragging ? dragLuminance : luminance;

	/** Full-saturation color for the right side of the gradient (HSV: hue, 100%, 100%). */
	const pureColorRgb = useMemo(() => hsvToRgb({ hue, saturation: 100, value: 100 }), [hue]);
	const pureColorCss = `rgb(${pureColorRgb.red}, ${pureColorRgb.green}, ${pureColorRgb.blue})`;

	/** Current color for the indicator (HSV: hue, saturation, value). */
	const indicatorColorRgb = useMemo(
		() => hsvToRgb({ hue, saturation: displaySaturation, value: displayLuminance }),
		[hue, displaySaturation, displayLuminance],
	);
	const indicatorColorCss = `rgb(${indicatorColorRgb.red}, ${indicatorColorRgb.green}, ${indicatorColorRgb.blue})`;

	const getPositionFromEvent = ({
		clientX,
		clientY,
	}: {
		clientX: number;
		clientY: number;
	}): { saturation: number; luminance: number } | null => {
		const container = containerReference.current;
		if (!container) return null;

		const { left, top, width, height } = container.getBoundingClientRect();
		const x = Math.max(0, Math.min(1, (clientX - left) / width));
		const y = Math.max(0, Math.min(1, (clientY - top) / height));
		return { saturation: x * 100, luminance: (1 - y) * 100 };
	};

	const handlePointerDown = (event: PointerEvent): void => {
		event.currentTarget.setPointerCapture(event.pointerId);
		setIsDragging(true);

		const position = getPositionFromEvent({ clientX: event.clientX, clientY: event.clientY });
		if (position) {
			setDragSaturation(position.saturation);
			setDragLuminance(position.luminance);
		}
	};

	const handlePointerMove = (event: PointerEvent): void => {
		if (!isDragging) return;

		const position = getPositionFromEvent({ clientX: event.clientX, clientY: event.clientY });
		if (position) {
			setDragSaturation(position.saturation);
			setDragLuminance(position.luminance);
		}
	};

	const handlePointerUp = (event: PointerEvent): void => {
		event.currentTarget.releasePointerCapture(event.pointerId);
		if (!isDragging) return;

		onChange(dragSaturation, dragLuminance);
		setIsDragging(false);
	};

	const handlePointerLeave = (): void => {
		if (!isDragging) return;
		onChange(dragSaturation, dragLuminance);
		setIsDragging(false);
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
		/** Larger step while holding Shift for faster keyboard adjustments. */
		const step = event.shiftKey ? 10 : 1;
		let nextSaturation = saturation;
		let nextLuminance = luminance;

		switch (event.key) {
			case 'ArrowLeft':
				nextSaturation -= step;
				break;
			case 'ArrowRight':
				nextSaturation += step;
				break;
			case 'ArrowUp':
				nextLuminance += step;
				break;
			case 'ArrowDown':
				nextLuminance -= step;
				break;
			default:
				return;
		}

		event.preventDefault();
		onChange(Math.max(0, Math.min(100, nextSaturation)), Math.max(0, Math.min(100, nextLuminance)));
	};

	return (
		<Container
			ref={containerReference}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerLeave={handlePointerLeave}
			onKeyDown={handleKeyDown}
			style={{
				background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pureColorCss})`,
			}}
			className={cn(
				'relative aspect-16/10 w-full cursor-crosshair overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary',
				!removeTopPadding && 'mt-2',
			)}
			data-slot="saturation-luminance-picker"
			role="slider"
			tabIndex={0}
			aria-label="Saturation and luminance"
			aria-valuetext={`Saturation ${Math.round(displaySaturation)}%, luminance ${Math.round(displayLuminance)}%`}
		>
			<Container
				style={{
					left: `${displaySaturation}%`,
					top: `${100 - displayLuminance}%`,
					backgroundColor: indicatorColorCss,
				}}
				className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
			/>
		</Container>
	);
}
