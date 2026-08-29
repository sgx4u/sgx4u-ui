'use client';

import { ChangeEvent, JSX, useRef, useState } from 'react';

import { HueSliderPropsType } from './color-picker.type';

import { Container } from '../container';
import { Input } from '../input';

/**
 * @description Hue slider (0–360). Fires onChange only on mouse/pointer release to avoid updates during drag.
 * @returns {JSX.Element} The HueSlider component.
 */
export function HueSlider({ value, onChange }: HueSliderPropsType): JSX.Element {
	const [isDragging, setIsDragging] = useState(false);
	const [dragValue, setDragValue] = useState(value);

	const inputReference = useRef<HTMLInputElement>(null);

	const displayValue = isDragging ? dragValue : value;

	const handlePointerDown = (): void => {
		setIsDragging(true);
		setDragValue(value);
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const newValue = Number(event.target.value);
		if (!isDragging) return;
		setDragValue(newValue);
	};

	const handlePointerUp = (): void => {
		if (!isDragging || !inputReference.current) return;
		const finalValue = Number(inputReference.current.value);
		onChange(finalValue);
		setIsDragging(false);
	};

	const handlePointerLeave = (): void => {
		if (!isDragging || !inputReference.current) return;
		const finalValue = Number(inputReference.current.value);
		onChange(finalValue);
		setIsDragging(false);
	};

	return (
		<Container
			onPointerUp={handlePointerUp}
			onPointerLeave={handlePointerLeave}
			onPointerCancel={handlePointerUp}
			style={{
				background: `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
			}}
			className="relative mt-2 h-4 w-full overflow-hidden rounded-full"
			data-slot="hue-slider"
		>
			<Input
				ref={inputReference}
				name="hue"
				type="range"
				value={displayValue}
				onPointerDown={handlePointerDown}
				onChange={handleChange}
				min={0}
				max={360}
				step={1}
				className="absolute inset-0 size-full max-w-full min-w-0 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 opacity-0"
				style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
				aria-label="Hue"
				aria-valuetext={`Hue ${Math.round(displayValue)}`}
			/>
			<Container
				style={{
					left: `${(displayValue / 360) * 100}%`,
					transform: 'translate(-50%, -50%)',
					backgroundColor: `hsl(${displayValue}, 100%, 50%)`,
				}}
				className="pointer-events-none absolute top-1/2 size-4 rounded-full border-2 border-white"
			/>
		</Container>
	);
}
