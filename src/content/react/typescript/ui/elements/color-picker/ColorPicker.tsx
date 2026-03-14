'use client';

import { CSSProperties, JSX, useEffect, useLayoutEffect, useState } from 'react';
import { SwatchBookIcon } from 'lucide-react';

import type {
	ColorFormatType,
	ColorPickerPropsType,
	ColorStopType,
	ColorType,
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

/** Default gradient value. */
const DEFAULT_GRADIENT: GradientColorType = buildGradientColorType({
	type: 'linear',
	angle: 90,
	stops: [
		{ id: 'stop-1', color: '#ffffff', position: 0 },
		{ id: 'stop-2', color: '#262626', position: 100 },
	],
});

/**
 * @description Color picker component with solid/gradient modes, eyedropper, formats, and deferred updates on drag.
 * @param {ColorPickerPropsType} props - The props for the ColorPicker component.
 * @returns {JSX.Element} The ColorPicker component.
 */
export function ColorPicker({
	value: colorValue,
	defaultValue,
	onChange,
	disabled,
	showSelectionOnTrigger = true,
	syncColor,

	onlySolidColorPicker = false,
	onlyGradientColorPicker = false,

	popoverProps,
	popoverTriggerProps,
	popoverContentProps,
}: ColorPickerPropsType): JSX.Element {
	/** Fallback default value when onlyGradientColorPicker or onlySolidColorPicker is true. */
	const fallbackDefault = onlyGradientColorPicker ? DEFAULT_GRADIENT : DEFAULT_SOLID;

	const [internalValue, setInternalValue] = useState<ColorType>((): ColorType => {
		if (colorValue) return colorValue;
		if (defaultValue) {
			const parsed = parseSyncColorString(defaultValue);
			if (parsed) return parsed;
		}
		return fallbackDefault;
	});
	const [format, setFormat] = useState<ColorFormatType>('hex');
	const [showAlpha, setShowAlpha] = useState(true);
	const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

	/** Whether the nested Select is open. This is used to ignore outside clicks from nested Selects. So that the color picker can still stay open when a nested Select gets closed. */
	const [isNestedSelectOpen, setIsNestedSelectOpen] = useState(false);

	useLayoutEffect((): void => {
		/** Parse the default value. */
		const parsedDefault = defaultValue ? parseSyncColorString(defaultValue) : null;

		/** Set the internal value. */
		if (onlySolidColorPicker) setInternalValue(colorValue ?? parsedDefault ?? DEFAULT_SOLID);
		if (onlyGradientColorPicker) setInternalValue(colorValue ?? parsedDefault ?? DEFAULT_GRADIENT);
	}, [colorValue, defaultValue, onlySolidColorPicker, onlyGradientColorPicker]);

	/** Sync internal state when syncColor prop changes. */
	useEffect((): void => {
		if (!syncColor) return;

		/** Parse the sync color string. */
		const parsed = parseSyncColorString(syncColor);
		if (!parsed) return;

		setInternalValue(parsed);
		if (parsed.mode === 'gradient' && parsed.stops.length > 0) {
			setSelectedStopId(parsed.stops[0].id);
		} else {
			setSelectedStopId(null);
		}
	}, [syncColor]);

	/** Controlled + Uncontrolled sync. */
	const currentValue = colorValue ?? internalValue;

	/** Whether the current value is a solid color. */
	const isSolid = currentValue.mode === 'solid';
	/** Solid value: either the provided solid value or the default solid value. */
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

	/** Effective hue, saturation, and value for the picker. */
	const { hue, saturation, value: luminance } = rgbToHsv(hexToRgb(normalizeHex(effectiveHex)));

	const handleGradientChange = (updates: Partial<GradientColorType>): void => {
		const merged = { ...gradientValue, ...updates };
		const next = buildGradientColorType({
			type: merged.type,
			angle: merged.angle,
			stops: merged.stops.map((stop) => ({ id: stop.id, color: stop.string, position: stop.position })),
		});

		(onChange as undefined | ((value: ColorType) => void))?.(next);
		setInternalValue(next);
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

		/** Update the gradient color value. */
		handleGradientChange({ stops: nextStops });
	};

	const handleDeleteStop = (stopId: string): void => {
		if (gradientValue.stops.length <= 2) return;
		const nextStops = gradientValue.stops.filter((stop) => stop.id !== stopId);

		/** Update the gradient color value. */
		handleGradientChange({ stops: nextStops });
		if (selectedStopId === stopId && nextStops.length > 0) {
			setSelectedStopId(nextStops[0].id);
		}
	};

	const handleColorChange = (hex: string, alpha: number): void => {
		/** If the current value is a solid color, update the solid color value. */
		if (isSolid) {
			const next = buildSolidColor({ hex: normalizeHex(hex), alpha: Math.max(0, Math.min(1, alpha)) });
			(onChange as undefined | ((value: ColorType) => void))?.(next);
			setInternalValue(next);
		} else {
			/** If the current value is a gradient color, update the gradient color value. */
			const stopId = selectedStopId ?? gradientValue.stops[0]?.id;
			if (!stopId) return;

			/** Get the stop from the gradient value. */
			const stop = gradientValue.stops.find((s) => s.id === stopId);
			if (!stop) return;

			/** Build the updated stop. */
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
		/** If the checkbox is checked, update the gradient color value. */
		if (checked) {
			/** Set the selected stop id to the first stop. */
			setSelectedStopId(DEFAULT_GRADIENT.stops[0].id);
			(onChange as undefined | ((value: ColorType) => void))?.(DEFAULT_GRADIENT);
			setInternalValue(DEFAULT_GRADIENT);
		} else {
			/** If the checkbox is unchecked, update the solid color value. */
			setSelectedStopId(null);
			const firstStop = gradientValue.stops[0];
			const hex = firstStop ? normalizeHex(firstStop.hex) : '#262626';
			const next = buildSolidColor({ hex, alpha: 1 });

			/** Update the solid color value. */
			(onChange as undefined | ((value: ColorType) => void))?.(next);
			setInternalValue(next);
		}
	};

	const handleEyedropper = (): void => {
		/** If the eyedropper is not supported, return. */
		if (typeof window === 'undefined' || !('EyeDropper' in window)) return;

		/** Create a new eyedropper instance. */
		const eyeDropper = new (
			window as Window & { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }
		).EyeDropper();

		/** Open the eyedropper and get the color. */
		eyeDropper
			.open()
			.then((result: { sRGBHex: string }) => {
				handleColorChange(result.sRGBHex, effectiveAlpha);
			})
			.catch(() => {});
	};

	/** Whether the eyedropper is supported. */
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
				className={cn('border-2', popoverTriggerClassName)}
				data-slot="color-picker-trigger"
				aria-label="Open color picker"
				{...popoverTriggerRestProps}
			>
				<SwatchBookIcon className="size-4 fill-primary" />
			</PopoverTrigger>

			<PopoverContent
				className={cn('flex flex-col gap-2 border p-1.5', popoverContentClassName)}
				data-slot="color-picker"
				{...popoverContentRestProps}
			>
				{!onlySolidColorPicker && !onlyGradientColorPicker && (
					<Container
						as="div"
						onClick={(event): void => event.stopPropagation()}
						className="flex cursor-pointer items-center gap-1 text-sm"
					>
						<Checkbox
							id="gradient-checkbox"
							checked={!isSolid}
							onCheckedChange={handleGradientCheckboxChange}
							className="size-4 rounded-sm"
							aria-label="Gradient"
						/>
						<Label htmlFor="gradient-checkbox">Gradient picker mode</Label>
					</Container>
				)}

				<Container as="div" className="flex flex-col gap-1.5">
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
						removeTopPadding={onlySolidColorPicker || onlyGradientColorPicker}
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
