'use client';

import { ChangeEvent, JSX, useRef, useState } from 'react';

import { Container } from '../container';
import { Input } from '../input';

/** Props for the AlphaSlider component. */
type AlphaSliderPropsType = {
	value: number;
	color: string;
	onChange: (value: number) => void;
};

/**
 * @description Alpha/transparency slider (0–1). Fires onChange only on mouse/pointer release.
 * @param {AlphaSliderPropsType} props - The props object.
 * @returns {JSX.Element} The AlphaSlider component.
 */
export function AlphaSlider({ value, color, onChange }: AlphaSliderPropsType): JSX.Element {
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
			className="relative h-4 w-full overflow-hidden rounded-full"
			onPointerUp={handlePointerUp}
			onPointerLeave={handlePointerLeave}
			onPointerCancel={handlePointerUp}
			data-slot="alpha-slider"
			aria-label="Alpha"
			aria-valuetext={`Alpha ${Math.round(displayValue * 100)}%`}
		>
			{/* Checkerboard background (like transparent image preview). */}
			<Container
				className="absolute inset-0 rounded-full"
				style={{
					backgroundColor: '#fff',
					backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
					backgroundSize: '8px 8px',
					backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
				}}
			/>

			{/* Alpha gradient overlay. */}
			<Container
				className="absolute inset-0 rounded-full"
				style={{ background: `linear-gradient(to right, transparent, ${color})` }}
			/>

			<Input
				ref={inputReference}
				type="range"
				value={displayValue}
				onPointerDown={handlePointerDown}
				onChange={handleChange}
				min={0}
				max={1}
				step={0.01}
				className="absolute inset-0 size-full max-w-full min-w-0 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 opacity-0"
				aria-label="Alpha"
				aria-valuetext={`Alpha ${Math.round(displayValue * 100)}%`}
			/>
			<Container
				className="pointer-events-none absolute top-1/2 size-4 overflow-hidden rounded-full border-2 border-white"
				style={{ left: `${displayValue * 100}%`, transform: 'translate(-50%, -50%)' }}
			>
				<Container
					className="absolute inset-0 rounded-full"
					style={{ backgroundColor: color, opacity: displayValue }}
				/>
			</Container>
		</Container>
	);
}
