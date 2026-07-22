'use client';

import { JSX, PointerEvent, MouseEvent as ReactMouseEvent, useMemo, useRef, useState } from 'react';

import { GradientColorType } from './color-picker.type';
import { cn } from '../../utils/styles.util';
import { getPositionFromClientX, gradientToCss } from './color-picker.helper';

import { Container } from '../container';

/** Props for the GradientPreviewBar component. */
type GradientPreviewBarPropsType = {
	gradientValue: GradientColorType;
	selectedStopId: string | null;
	onSelectedStopChange: (stopId: string) => void;
	onAddStopAtPosition: (position: number) => void;
	onStopPositionChange: (stopId: string, position: number) => void;
	onDeleteStop?: (stopId: string) => void;
	className?: string;
};

/**
 * @description Gradient preview bar with white circle indicators for each stop, matching saturation/alpha picker style.
 * Click empty space to add a stop; drag stops to change position; click a stop to select it.
 * @returns {JSX.Element} The GradientPreviewBar component.
 */
export function GradientPreviewBar({
	gradientValue,
	selectedStopId,
	onSelectedStopChange,
	onAddStopAtPosition,
	onStopPositionChange,
	onDeleteStop,
	className,
}: GradientPreviewBarPropsType): JSX.Element {
	const [draggingStopId, setDraggingStopId] = useState<string | null>(null);
	const [dragPosition, setDragPosition] = useState<number | null>(null);

	const containerReference = useRef<HTMLDivElement>(null);

	const sortedStops = useMemo(
		() => [...gradientValue.stops].sort((a, b) => a.position - b.position),
		[gradientValue],
	);

	const getPositionFromEvent = (clientX: number): number => {
		const container = containerReference.current;
		if (!container) return 50;

		/** Compute the new position from the event. */
		return getPositionFromClientX({ clientX, rect: container.getBoundingClientRect() });
	};

	const handleBarClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
		if (event.target !== event.currentTarget) return;

		/** Compute the new position from the event. */
		const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
		const position = getPositionFromClientX({ clientX: event.clientX, rect });
		onAddStopAtPosition(position);
	};

	const handleStopPointerDown = (event: PointerEvent, stopId: string): void => {
		event.stopPropagation();
		event.currentTarget.setPointerCapture(event.pointerId);

		/** Select the stop. */
		onSelectedStopChange(stopId);
		setDraggingStopId(stopId);
		setDragPosition(getPositionFromEvent(event.clientX));
	};

	const handleStopPointerMove = (event: PointerEvent, stopId: string): void => {
		if (draggingStopId !== stopId) return;

		/** Compute the new position from the event. */
		const position = getPositionFromEvent(event.clientX);
		setDragPosition(position);
		onStopPositionChange(stopId, position);
	};

	const handleStopPointerUp = (event: PointerEvent): void => {
		event.currentTarget.releasePointerCapture(event.pointerId);

		/** Reset the dragging state. */
		setDraggingStopId(null);
		setDragPosition(null);
	};

	return (
		<Container
			ref={containerReference}
			onClick={handleBarClick}
			style={{ background: gradientToCss(gradientValue) }}
			className={cn('relative h-4 w-full cursor-crosshair overflow-hidden rounded-full', className)}
			data-slot="gradient-preview-bar"
			aria-label="Gradient stops"
		>
			{sortedStops.map((stop) => {
				const displayPosition =
					draggingStopId === stop.id && dragPosition !== null ? dragPosition : stop.position;

				return (
					<Container
						key={stop.id}
						onPointerDown={(event): void => handleStopPointerDown(event, stop.id)}
						onPointerMove={(event): void => handleStopPointerMove(event, stop.id)}
						onPointerUp={handleStopPointerUp}
						onPointerCancel={handleStopPointerUp}
						onKeyDown={(event): void => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								onSelectedStopChange(stop.id);
							}
							if ((event.key === 'Delete' || event.key === 'Backspace') && onDeleteStop) {
								event.preventDefault();
								onDeleteStop(stop.id);
							}
						}}
						style={{ left: `${displayPosition}%`, backgroundColor: stop.string }}
						className={cn(
							'absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 cursor-grab overflow-hidden rounded-full border-2 transition-shadow active:cursor-grabbing',
							selectedStopId === stop.id ? 'border-white' : 'border-white/60',
						)}
						role="button"
						tabIndex={0}
						aria-label={`Color stop at ${Math.round(displayPosition)}%`}
						aria-pressed={selectedStopId === stop.id}
					/>
				);
			})}
		</Container>
	);
}
