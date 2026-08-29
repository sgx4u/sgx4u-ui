'use client';

import { ChangeEvent, JSX, useEffect, useId, useState } from 'react';
import { PipetteIcon } from 'lucide-react';

import { ColorFormatInputPropsType, ColorFormatType } from './color-picker.type';
import { formatColorForDisplay, parseColorInput } from './color-picker.helper';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Container } from '../container';
import { Input } from '../input';
import { Label } from '../label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../select';

/**
 * @description Manual color input for hex, rgb, hsl, hsv, and cmyk formats.
 * @returns {JSX.Element} The ColorFormatInput component.
 */
export function ColorFormatInput({
	format,
	hex,
	alpha,
	showAlpha,
	eyedropperSupported,

	onFormatChange,
	onColorChange,
	onShowAlphaChange,
	onEyedropperClick,
	onSelectOpenChange,
}: ColorFormatInputPropsType): JSX.Element {
	const effectiveAlpha = showAlpha ? alpha : 1;

	/** Unique id linking the show-alpha checkbox to its label. */
	const showAlphaCheckboxId = useId();

	const [inputValue, setInputValue] = useState(
		formatColorForDisplay({ hex, format, alpha: effectiveAlpha, includeAlpha: showAlpha }),
	);

	useEffect((): void => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setInputValue(formatColorForDisplay({ hex, format, alpha: effectiveAlpha, includeAlpha: showAlpha }));
	}, [hex, format, effectiveAlpha, showAlpha]);

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const value = event.target.value;
		setInputValue(value);

		const parsed = parseColorInput({ value, format });
		if (parsed) onColorChange(parsed.hex, showAlpha ? parsed.alpha : 1);
	};

	const handleBlur = (): void => {
		setInputValue(formatColorForDisplay({ hex, format, alpha: effectiveAlpha, includeAlpha: showAlpha }));
	};

	const handleFormatChange = (values: Array<string>): void => {
		const newFormat = (values[0] ?? 'hex') as ColorFormatType;
		onFormatChange(newFormat);
		setInputValue(
			formatColorForDisplay({ hex, format: newFormat, alpha: effectiveAlpha, includeAlpha: showAlpha }),
		);
	};

	const handleAlphaCheckboxChange = (checked: boolean): void => {
		onShowAlphaChange(checked);
		if (!checked) onColorChange(hex, 1);
	};

	return (
		<Container className="mt-1 flex flex-col gap-1.5">
			<Container
				onClick={(event): void => event.stopPropagation()}
				className="flex w-max cursor-pointer items-center gap-1 text-sm"
			>
				<Checkbox
					id={showAlphaCheckboxId}
					name="show-alpha"
					checked={showAlpha}
					onCheckedChange={handleAlphaCheckboxChange}
					className="size-4 rounded-sm"
					aria-label="Show alpha"
				/>
				<Label htmlFor={showAlphaCheckboxId}>Show alpha</Label>
			</Container>

			<Container className="flex gap-1" data-slot="color-format-input">
				{eyedropperSupported && (
					<Button
						onClick={onEyedropperClick}
						variant="outline"
						size="icon"
						className="size-8"
						aria-label="Pick color"
					>
						<PipetteIcon className="size-4" />
					</Button>
				)}

				<Input
					name="color-value"
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleBlur}
					inputSize="sm"
					className="h-8 w-36 max-w-full min-w-0"
					aria-label="Color value"
					aria-valuetext={inputValue}
				/>

				<Select value={[format]} onValueChange={handleFormatChange} onOpenChange={onSelectOpenChange}>
					<SelectTrigger size="sm" className="h-8 w-22 shrink-0 px-1.5" arrowClassName="ml-2">
						{format.toUpperCase()}
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="hex">HEX</SelectItem>
						<SelectItem value="rgb">RGB</SelectItem>
						<SelectItem value="hsl">HSL</SelectItem>
						<SelectItem value="hsv">HSV</SelectItem>
						<SelectItem value="cmyk">CMYK</SelectItem>
					</SelectContent>
				</Select>
			</Container>
		</Container>
	);
}
