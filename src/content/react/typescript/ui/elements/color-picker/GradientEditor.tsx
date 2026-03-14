'use client';

import { JSX, useMemo } from 'react';
import { PercentIcon, Scale3DIcon, Trash2Icon } from 'lucide-react';

import type { ColorStopType, GradientType } from './color-picker.type';
import { cn } from '../../utils/styles.util';

import { Button } from '../button';
import { Container } from '../container';
import { Input } from '../input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../select';

/** Props for the GradientEditor component. */
type GradientEditorPropsType = {
	/** Gradient type. */
	type: GradientType;
	/** Gradient angle. */
	angle: number;
	/** Gradient stops. */
	stops: Array<ColorStopType>;
	/** Selected stop ID. */
	selectedStopId: string | null;
	/** Callback when the selected stop changes. */
	onSelectedStopChange: (stopId: string | null) => void;
	/** Callback when the gradient type changes. */
	onTypeChange: (type: GradientType) => void;
	/** Callback when the gradient angle changes. */
	onAngleChange: (angle: number) => void;
	/** Callback when the gradient stops change. */
	onStopsChange: (stops: Array<ColorStopType>) => void;
	/** Callback when the gradient type Select opens or closes. */
	onSelectOpenChange?: (open: boolean) => void;
};

/**
 * @description Editor for gradient type, angle, and color stops.
 * @param {GradientEditorPropsType} props - The props object.
 * @returns {JSX.Element} The GradientEditor component.
 */
export function GradientEditor({
	type,
	angle,
	stops,
	selectedStopId,
	onSelectedStopChange,
	onTypeChange,
	onAngleChange,
	onStopsChange,
	onSelectOpenChange,
}: GradientEditorPropsType): JSX.Element {
	/** Ensure the stops array is not null. */
	const safeStops = useMemo(() => stops ?? [], [stops]);

	/** Find the selected stop. */
	const selectedStop = useMemo(
		() => safeStops.find((stop) => stop.id === selectedStopId) ?? null,
		[safeStops, selectedStopId],
	);

	const handleRemoveSelectedStop = (): void => {
		if (!selectedStopId || safeStops.length <= 2) return;

		/** Remove the selected stop. */
		const nextStops = safeStops.filter((stop) => stop.id !== selectedStopId);
		onStopsChange(nextStops);

		/** Select the first stop if there are any remaining. */
		if (nextStops.length > 0) onSelectedStopChange(nextStops[0].id);
	};

	const handleSelectedStopPositionChange = (position: number): void => {
		if (!selectedStopId) return;

		/** Clamp the position to 0–100. */
		const clamped = Math.max(0, Math.min(100, position));
		onStopsChange(
			safeStops
				.map((stop) => (stop.id === selectedStopId ? { ...stop, position: clamped } : stop))
				.sort((a, b) => a.position - b.position),
		);
	};

	const handleTypeChange = (values: Array<string>): void => {
		const newType = (values[0] ?? 'linear') as GradientType;
		onTypeChange(newType);
	};

	return (
		<Container as="div" className="flex flex-col gap-3" data-slot="gradient-editor">
			<Container as="div" className="flex flex-wrap items-center gap-1">
				<Button
					variant="outline"
					size="icon"
					aria-label="Remove selected stop"
					onClick={handleRemoveSelectedStop}
					disabled={!selectedStop || stops.length <= 2}
				>
					<Trash2Icon className="size-4" />
				</Button>

				<Container as="div" className="relative">
					<Input
						type="number"
						value={selectedStop ? Math.round(selectedStop.position) : ''}
						onChange={(event): void => handleSelectedStopPositionChange(Number(event.target.value) || 0)}
						min={0}
						max={100}
						inputSize="sm"
						className="w-17.5 min-w-0"
						aria-label="Selected stop position"
						disabled={!selectedStop}
					/>
					<PercentIcon className="absolute top-1/2 right-1.5 size-4 -translate-y-1/2" />
				</Container>

				<Container as="div" className="relative">
					<Input
						id="gradient-angle"
						type="number"
						min={0}
						max={360}
						value={angle}
						onChange={(event): void => onAngleChange(Number(event.target.value) || 0)}
						inputSize="sm"
						disabled={type !== 'linear' && type !== 'conic'}
						className="w-17.5 min-w-0"
						aria-label="Gradient angle"
					/>
					<Scale3DIcon
						className={cn(
							'absolute top-1/2 right-1.5 size-4 -translate-y-1/2',
							type !== 'linear' && type !== 'conic' ? 'opacity-50' : '',
						)}
					/>
				</Container>

				<Select value={[type]} onValueChange={handleTypeChange} onOpenChange={onSelectOpenChange}>
					<SelectTrigger size="sm" className="w-22 shrink-0 px-1.5" arrowClassName="ml-2">
						{type.charAt(0).toUpperCase() + type.slice(1)}
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="linear">Linear</SelectItem>
						<SelectItem value="radial">Radial</SelectItem>
						<SelectItem value="conic">Conic</SelectItem>
					</SelectContent>
				</Select>
			</Container>
		</Container>
	);
}
