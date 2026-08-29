'use client';

import { CSSProperties, JSX, useEffect, useId, useState } from 'react';
import { SwatchBookIcon } from 'lucide-react';

import {
	ColorFormatType,
	ColorPickerPropsType,
	ColorStopType,
	ColorType,
	EyeDropperConstructorType,
	GradientColorType,
	GradientType,
	SolidColorType,
} from './color-picker.type';
import { cn } from '../../utils/styles.util';
import {
	buildColorStop,
	buildGradientColorType,
	buildSolidColor,
	gradientToCss,
	hexAlphaToRgba,
	hexToRgb,
	hexWithAlpha,
	hsvToRgb,
	normalizeHex,
	parseSyncColorString,
	rgbToHex,
	rgbToHsv,
} from './color-picker.helper';

import { Checkbox } from '../checkbox';
import { Container } from '../container';
import { Label } from '../label';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { AlphaSlider } from './AlphaSlider';
import { ColorFormatInput } from './ColorFormatInput';
import { GradientEditor } from './GradientEditor';
import { GradientPreviewBar } from './GradientPreviewBar';
import { HueSlider } from './HueSlider';
import { SaturationLuminancePicker } from './SaturationLuminancePicker';

/** Default solid color value. */
const DEFAULT_SOLID: SolidColorType = buildSolidColor({ hex: '#262626', alpha: 1 });

/** Default gradient value. Uses chromatic stops so hue edits are immediately visible. */
const DEFAULT_GRADIENT: GradientColorType = buildGradientColorType({
	type: 'linear',
	angle: 90,
	stops: [
		{ id: 'stop-1', color: '#6366f1', position: 0 },
		{ id: 'stop-2', color: '#ec4899', position: 100 },
	],
});

/**
 * @description Color picker component with solid/gradient modes, eyedropper, formats, and deferred updates on drag.
 * @returns {JSX.Element} The ColorPicker component.
 */
export function ColorPicker({
	value: colorValue,
	defaultValue,
	onChange,
	disabled,
	showSelectionOnTrigger = true,

	mode = 'both',

	popoverProps,
	popoverTriggerProps,
	popoverContentProps,
}: ColorPickerPropsType): JSX.Element {
	/** Unique id linking the gradient-mode checkbox to its label. */
	const gradientCheckboxId = useId();

	const [internalValue, setInternalValue] = useState<ColorType>((): ColorType => {
		if (colorValue) return colorValue;

		/** Use the default value only when it matches the mode enforced by the picker. */
		const parsed = defaultValue ? parseSyncColorString(defaultValue) : null;
		if (mode === 'solid') return parsed?.mode === 'solid' ? parsed : DEFAULT_SOLID;
		if (mode === 'gradient') return parsed?.mode === 'gradient' ? parsed : DEFAULT_GRADIENT;
		return parsed ?? DEFAULT_SOLID;
	});
	const [format, setFormat] = useState<ColorFormatType>('hex');
	const [showAlpha, setShowAlpha] = useState(true);
	const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

	/** Whether a nested Select is open, so its outside clicks do not close the picker popover. */
	const [isNestedSelectOpen, setIsNestedSelectOpen] = useState(false);

	/** Emit a change to the consumer. The prop signature narrows by mode, so a single cast keeps every call site clean. */
	const emitChange = onChange as ((value: ColorType) => void) | undefined;

	/**
	 * @description Commits a new color: notifies the consumer and, when uncontrolled, updates internal state.
	 * @param {ColorType} next - The next color value.
	 * @returns {void}
	 */
	const commit = (next: ColorType): void => {
		emitChange?.(next);
		if (colorValue === undefined) setInternalValue(next);
	};

	/** Controlled + Uncontrolled sync. */
	const currentValue = colorValue ?? internalValue;

	const isSolid = currentValue.mode === 'solid';
	const solidValue = isSolid ? currentValue : DEFAULT_SOLID;

	/** Gradient value: either the provided gradient value or the default gradient value. */
	const gradientValue =
		isSolid || currentValue.mode !== 'gradient'
			? DEFAULT_GRADIENT
			: buildGradientColorType({
					type: currentValue.type ?? 'linear',
					angle: currentValue.angle ?? 90,
					stops: (Array.isArray(currentValue.stops) && currentValue.stops.length >= 2
						? currentValue.stops
						: DEFAULT_GRADIENT.stops
					).map((stop) => ({ id: stop.id, color: stop.string, position: stop.position })),
				});

	/** Effective color for the picker: solid value or selected gradient stop. */
	const { hex: effectiveHex, alpha: effectiveAlpha } = isSolid
		? { hex: solidValue.hex, alpha: solidValue.alpha }
		: ((): { hex: string; alpha: number } => {
				const selectedStop = gradientValue.stops.find((stop) => stop.id === selectedStopId);
				const firstStop = gradientValue.stops[0];
				const stop = selectedStop ?? firstStop;
				return stop ? { hex: stop.hex, alpha: stop.alpha } : { hex: '#262626', alpha: 1 };
			})();

	const derivedHsv = rgbToHsv(hexToRgb(normalizeHex(effectiveHex)));

	/** Achromatic colors (saturation 0) have no recoverable hue, so persist the last meaningful hue to keep the hue slider usable on white, grey, and black. */
	const [preservedHue, setPreservedHue] = useState(derivedHsv.hue);

	useEffect((): void => {
		if (derivedHsv.saturation === 0 || derivedHsv.hue === preservedHue) return;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPreservedHue(derivedHsv.hue);
	}, [derivedHsv.saturation, derivedHsv.hue, preservedHue]);

	const hue = derivedHsv.saturation === 0 ? preservedHue : derivedHsv.hue;
	const saturation = derivedHsv.saturation;
	const luminance = derivedHsv.value;

	const handleGradientChange = (updates: Partial<GradientColorType>): void => {
		const merged = { ...gradientValue, ...updates };
		const next = buildGradientColorType({
			type: merged.type,
			angle: merged.angle,
			stops: merged.stops.map((stop) => ({ id: stop.id, color: stop.string, position: stop.position })),
		});

		commit(next);
	};

	const handleAddStopAtPosition = (position: number): void => {
		const newStop = buildColorStop({
			// eslint-disable-next-line react-hooks/purity
			id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
			color: hexWithAlpha({ hex: effectiveHex, alpha: effectiveAlpha }),
			position: Math.max(0, Math.min(100, position)),
		});

		const nextStops = [...gradientValue.stops, newStop].sort((a, b) => a.position - b.position);
		setSelectedStopId(newStop.id);
		handleGradientChange({ stops: nextStops });
	};

	const handleStopPositionChange = (stopId: string, position: number): void => {
		const clamped = Math.max(0, Math.min(100, position));
		const nextStops = gradientValue.stops
			.map((stop) => (stop.id === stopId ? { ...stop, position: clamped } : stop))
			.sort((a, b) => a.position - b.position);

		handleGradientChange({ stops: nextStops });
	};

	const handleDeleteStop = (stopId: string): void => {
		if (gradientValue.stops.length <= 2) return;
		const nextStops = gradientValue.stops.filter((stop) => stop.id !== stopId);

		handleGradientChange({ stops: nextStops });
		if (selectedStopId === stopId && nextStops.length > 0) {
			setSelectedStopId(nextStops[0].id);
		}
	};

	const handleColorChange = (hex: string, alpha: number): void => {
		if (isSolid) {
			const next = buildSolidColor({ hex: normalizeHex(hex), alpha: Math.max(0, Math.min(1, alpha)) });
			commit(next);
		} else {
			/** If the current value is a gradient color, update the gradient color value. */
			const stopId = selectedStopId ?? gradientValue.stops[0]?.id;
			if (!stopId) return;

			const stop = gradientValue.stops.find((s) => s.id === stopId);
			if (!stop) return;

			const updatedStop = buildColorStop({
				id: stop.id,
				color: hexWithAlpha({ hex: normalizeHex(hex), alpha }),
				position: stop.position,
			});
			const nextStops = gradientValue.stops.map((s) => (s.id === stopId ? updatedStop : s));
			handleGradientChange({ stops: nextStops });
		}
	};

	const handleHueChange = (newHue: number): void => {
		/** Remember the picked hue even when the resulting color is achromatic, so the slider does not snap back. */
		setPreservedHue(newHue);
		const rgb = hsvToRgb({ hue: newHue, saturation, value: luminance });
		handleColorChange(rgbToHex({ rgb }), effectiveAlpha);
	};

	const handleSaturationLuminanceChange = (newSaturation: number, newLuminance: number): void => {
		const rgb = hsvToRgb({ hue, saturation: newSaturation, value: newLuminance });
		handleColorChange(rgbToHex({ rgb }), effectiveAlpha);
	};

	const handleAlphaChange = (newAlpha: number): void => {
		handleColorChange(effectiveHex, newAlpha);
	};

	const handleGradientCheckboxChange = (checked: boolean): void => {
		if (checked) {
			/** Switch to gradient mode, selecting the first stop. */
			setSelectedStopId(DEFAULT_GRADIENT.stops[0].id);
			commit(DEFAULT_GRADIENT);
		} else {
			/** Switch to solid mode, seeding from the first gradient stop. */
			setSelectedStopId(null);
			const firstStop = gradientValue.stops[0];
			const hex = firstStop ? normalizeHex(firstStop.hex) : '#262626';
			commit(buildSolidColor({ hex, alpha: 1 }));
		}
	};

	const handleEyedropper = (): void => {
		/** Guard against unsupported environments. */
		const eyeDropperConstructor = (window as unknown as { EyeDropper?: EyeDropperConstructorType }).EyeDropper;
		if (!eyeDropperConstructor) return;

		/** Open the eyedropper and apply the picked color. The promise rejects when the user cancels, which is not an error. */
		new eyeDropperConstructor()
			.open()
			.then((result) => handleColorChange(result.sRGBHex, effectiveAlpha))
			.catch(() => {});
	};

	const eyedropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

	/** Trigger style when showSelectionOnTrigger is true: solid uses backgroundColor, gradient uses background. */
	const triggerStyle: CSSProperties | undefined = !showSelectionOnTrigger
		? undefined
		: isSolid
			? { backgroundColor: hexAlphaToRgba(effectiveHex, effectiveAlpha) }
			: { background: gradientToCss(gradientValue) };

	const { className: popoverTriggerClassName, ...popoverTriggerRestProps } = popoverTriggerProps ?? {};
	const { className: popoverContentClassName, ...popoverContentRestProps } = popoverContentProps ?? {};

	return (
		<Popover ignoreOutsideClick={isNestedSelectOpen} {...popoverProps}>
			<PopoverTrigger
				disabled={disabled}
				style={triggerStyle}
				className={popoverTriggerClassName}
				data-slot="color-picker-trigger"
				aria-label="Open color picker"
				{...popoverTriggerRestProps}
			>
				<SwatchBookIcon className="size-4" />
			</PopoverTrigger>

			<PopoverContent
				className={cn('flex flex-col gap-2 border p-1.5', popoverContentClassName)}
				data-slot="color-picker"
				{...popoverContentRestProps}
			>
				{mode === 'both' && (
					<Container
						onClick={(event): void => event.stopPropagation()}
						className="flex cursor-pointer items-center gap-1 text-sm"
					>
						<Checkbox
							id={gradientCheckboxId}
							name="gradient"
							checked={!isSolid}
							onCheckedChange={handleGradientCheckboxChange}
							className="size-4 rounded-sm"
							aria-label="Gradient"
						/>
						<Label htmlFor={gradientCheckboxId}>Gradient picker mode</Label>
					</Container>
				)}

				<Container className="flex flex-col gap-1.5">
					{!isSolid && (
						<GradientPreviewBar
							gradientValue={gradientValue}
							selectedStopId={selectedStopId}
							onSelectedStopChange={setSelectedStopId}
							onAddStopAtPosition={handleAddStopAtPosition}
							onStopPositionChange={handleStopPositionChange}
							onDeleteStop={handleDeleteStop}
						/>
					)}

					<SaturationLuminancePicker
						hue={hue}
						saturation={saturation}
						luminance={luminance}
						onChange={handleSaturationLuminanceChange}
						removeTopPadding={mode !== 'both'}
					/>
					<HueSlider value={hue} onChange={handleHueChange} />
					{showAlpha && (
						<AlphaSlider
							value={effectiveAlpha}
							color={hexAlphaToRgba(effectiveHex, 1)}
							onChange={handleAlphaChange}
						/>
					)}

					<ColorFormatInput
						hex={effectiveHex}
						alpha={effectiveAlpha}
						showAlpha={showAlpha}
						format={format}
						onFormatChange={setFormat}
						onColorChange={handleColorChange}
						onShowAlphaChange={setShowAlpha}
						eyedropperSupported={eyedropperSupported}
						onEyedropperClick={handleEyedropper}
						onSelectOpenChange={setIsNestedSelectOpen}
					/>

					{!isSolid && (
						<GradientEditor
							type={gradientValue.type}
							angle={gradientValue.angle}
							stops={gradientValue.stops}
							selectedStopId={selectedStopId}
							onSelectedStopChange={setSelectedStopId}
							onTypeChange={(type: GradientType): void => handleGradientChange({ type })}
							onAngleChange={(angle: number): void => handleGradientChange({ angle })}
							onStopsChange={(stops: Array<ColorStopType>): void => handleGradientChange({ stops })}
							onSelectOpenChange={setIsNestedSelectOpen}
						/>
					)}
				</Container>
			</PopoverContent>
		</Popover>
	);
}
