import {
	CMYK,
	ColorFormatType,
	ColorStopType,
	ColorType,
	GradientColorType,
	GradientType,
	HSL,
	HSV,
	RGB,
	SolidColorType,
} from './color-picker.type';

/**
 * @description Builds SolidColorType from hex and alpha.
 * @param {object} props - The parameters.
 * @param {string} props.hex - The hex color.
 * @param {number} props.alpha - Alpha 0–1.
 * @returns {SolidColorType} The full solid color return type.
 */
export function buildSolidColor({ hex, alpha }: { hex: string; alpha: number }): SolidColorType {
	const normalizedHex = normalizeHex(hex);
	const clampedAlpha = Math.max(0, Math.min(1, alpha));

	const rgb = hexToRgb(normalizedHex);
	const hsl = rgbToHsl(rgb);
	const hsv = rgbToHsv(rgb);
	const cmyk = rgbToCmyk(rgb);
	const string =
		clampedAlpha < 1 ? hexAlphaToRgba(normalizedHex, clampedAlpha) : rgbToHex({ rgb, includeAlpha: false });

	return {
		mode: 'solid',
		hex: normalizedHex,
		alpha: clampedAlpha,
		rgb,
		hsl,
		hsv,
		cmyk,
		string,
	};
}

/**
 * @description Normalizes hex to always include # and 6 digits.
 * @param {string} hex - The hex string.
 * @returns {string} Normalized hex.
 */
export function normalizeHex(hex: string): string {
	const cleaned = hex.replace(/^#/, '').trim();
	if (cleaned.length === 3) {
		return `#${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`;
	}
	return cleaned.length >= 6 ? `#${cleaned.slice(0, 6)}` : '#000000';
}

/**
 * @description Parses a hex string to RGB.
 * @param {string} hex - Hex color (e.g. #fff, #ffffff, #ffffffff).
 * @returns {RGB} The RGB values.
 */
export function hexToRgb(hex: string): RGB {
	/** Remove the # and trim the string. */
	const normalized = hex.replace(/^#/, '').trim();
	const length = normalized.length;

	/** If the length is not 3, 6, or 8, return 0, 0, 0. */
	if (length !== 3 && length !== 6 && length !== 8) {
		return { red: 0, green: 0, blue: 0 };
	}

	/** If the length is 3, expand the hex string to 6 digits. */
	const expanded =
		length === 3
			? normalized
					.split('')
					.map((character) => character + character)
					.join('')
			: normalized;

	/** Parse the red, green, and blue values from the expanded hex string. */
	const red = parseInt(expanded.slice(0, 2), 16) || 0;
	const green = parseInt(expanded.slice(2, 4), 16) || 0;
	const blue = parseInt(expanded.slice(4, 6), 16) || 0;
	return { red, green, blue };
}

/**
 * @description Converts RGB to HSL.
 * @param {RGB} rgb - The RGB values.
 * @returns {HSL} The HSL values.
 */
export function rgbToHsl(rgb: RGB): HSL {
	/** Convert the red, green, and blue values to percentages. */
	const red = rgb.red / 255;
	const green = rgb.green / 255;
	const blue = rgb.blue / 255;

	/** Find the maximum and minimum values. */
	const maximum = Math.max(red, green, blue);
	const minimum = Math.min(red, green, blue);

	/** Calculate the lightness. */
	let hue = 0;
	let saturation = 0;
	const lightness = (maximum + minimum) / 2;

	/** If the maximum and minimum values are not equal, calculate the saturation and hue. */
	if (maximum !== minimum) {
		const delta = maximum - minimum;
		saturation = lightness > 0.5 ? delta / (2 - maximum - minimum) : delta / (maximum + minimum);

		if (maximum === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6;
		else if (maximum === green) hue = ((blue - red) / delta + 2) / 6;
		else hue = ((red - green) / delta + 4) / 6;
	}

	/** Return the HSL values. */
	return {
		hue: Math.round(hue * 360),
		saturation: Math.round(saturation * 100),
		lightness: Math.round(lightness * 100),
	};
}

/**
 * @description Converts RGB to HSV.
 * @param {RGB} rgb - The RGB values.
 * @returns {HSV} The HSV values.
 */
export function rgbToHsv(rgb: RGB): HSV {
	/** Convert the red, green, and blue values to percentages. */
	const red = rgb.red / 255;
	const green = rgb.green / 255;
	const blue = rgb.blue / 255;

	/** Find the maximum and minimum values. */
	const maximum = Math.max(red, green, blue);
	const minimum = Math.min(red, green, blue);

	/** Calculate the delta. */
	const delta = maximum - minimum;
	let hue = 0;

	/** If the delta is not 0, calculate the hue. */
	if (delta !== 0) {
		if (maximum === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6;
		else if (maximum === green) hue = ((blue - red) / delta + 2) / 6;
		else hue = ((red - green) / delta + 4) / 6;
	}

	/** Calculate the saturation and value. */
	const saturation = maximum === 0 ? 0 : delta / maximum;
	const value = maximum;

	/** Return the HSV values. */
	return {
		hue: Math.round(hue * 360),
		saturation: Math.round(saturation * 100),
		value: Math.round(value * 100),
	};
}

/**
 * @description Converts RGB to CMYK.
 * @param {RGB} rgb - The RGB values.
 * @returns {CMYK} The CMYK values.
 */
export function rgbToCmyk(rgb: RGB): CMYK {
	/** Convert the red, green, and blue values to percentages. */
	const red = rgb.red / 255;
	const green = rgb.green / 255;
	const blue = rgb.blue / 255;
	const black = 1 - Math.max(red, green, blue);

	/** If the black value is 1, return 0, 0, 0, 100. */
	if (black === 1) return { cyan: 0, magenta: 0, yellow: 0, black: 100 };

	/** Calculate the cyan, magenta, and yellow values. */
	const cyan = ((1 - red - black) / (1 - black)) * 100;
	const magenta = ((1 - green - black) / (1 - black)) * 100;
	const yellow = ((1 - blue - black) / (1 - black)) * 100;

	return {
		cyan: Math.round(cyan),
		magenta: Math.round(magenta),
		yellow: Math.round(yellow),
		black: Math.round(black * 100),
	};
}

/**
 * @description Converts hex and alpha to rgba string.
 * @param {string} hex - The hex color.
 * @param {number} alpha - Alpha 0–1.
 * @returns {string} The rgba string.
 */
export function hexAlphaToRgba(hex: string, alpha: number): string {
	const rgb = hexToRgb(hex);
	const clampedAlpha = Math.max(0, Math.min(1, alpha));
	return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${clampedAlpha})`;
}

/**
 * @description Builds GradientColorType from gradient structure.
 * @param {object} props - The parameters.
 * @param {GradientType} props.type - The gradient type.
 * @param {number} props.angle - The gradient angle.
 * @param {Array<{ id: string; color: string; position: number }>} props.stops - The color stops.
 * @returns {GradientColorType} The gradient color type.
 */
export function buildGradientColorType({
	type,
	angle,
	stops,
}: {
	type: GradientType;
	angle: number;
	stops: Array<{ id: string; color: string; position: number }>;
}): GradientColorType {
	const stopTypes = stops.map((stop) => buildColorStop({ id: stop.id, color: stop.color, position: stop.position }));
	const stopsString = [...stopTypes]
		.sort((a, b) => a.position - b.position)
		.map((stop) => `${stop.string} ${stop.position}%`)
		.join(', ');

	const string =
		type === 'linear'
			? `linear-gradient(${angle}deg, ${stopsString})`
			: type === 'radial'
				? `radial-gradient(circle, ${stopsString})`
				: `conic-gradient(from ${angle}deg, ${stopsString})`;

	return {
		mode: 'gradient',
		type,
		angle,
		stops: stopTypes,
		string,
	};
}

/**
 * @description Builds ColorStopType from color string and position.
 * @param {object} props - The parameters.
 * @param {string} props.id - The stop id.
 * @param {string} props.color - The color (hex or rgba).
 * @param {number} props.position - Position 0–100.
 * @returns {ColorStopType} The color stop type.
 */
export function buildColorStop({
	id,
	color,
	position,
}: {
	id: string;
	color: string;
	position: number;
}): ColorStopType {
	const { hex, alpha } = parseHexColor(color);
	const solid = buildSolidColor({ hex, alpha });

	return {
		id,
		position: Math.max(0, Math.min(100, position)),
		hex: solid.hex,
		alpha: solid.alpha,
		rgb: solid.rgb,
		hsl: solid.hsl,
		hsv: solid.hsv,
		cmyk: solid.cmyk,
		string: solid.string,
	};
}

/**
 * @description Parses a hex color string into 6-digit hex and alpha.
 * @param {string} color - Hex color (e.g. #fff, #ffffff, #ffffffff).
 * @returns {{ hex: string; alpha: number }} Parsed hex (6-digit) and alpha (0–1).
 */
export function parseHexColor(color: string): { hex: string; alpha: number } {
	const normalized = color.replace(/^#/, '').trim();
	if (!/^[0-9a-fA-F]{3,8}$/.test(normalized)) return { hex: '#000000', alpha: 1 };

	/** If the length is 3, expand the hex string to 6 digits. */
	const expanded =
		normalized.length === 3
			? normalized
					.split('')
					.map((character) => character + character)
					.join('')
			: normalized;

	/** Get the first 6 digits of the expanded hex string. */
	const sixDigit = expanded.slice(0, 6);
	const hex = `#${sixDigit}`;
	const alpha = expanded.length === 8 ? Math.max(0, Math.min(1, parseInt(expanded.slice(6, 8), 16) / 255)) : 1;

	return { hex, alpha };
}

/**
 * @description Parses a color string (hex, rgb, rgba, hsl, hsla, or gradient CSS) into ColorType.
 * @param {string} colorValue - The color string.
 * @returns {ColorType | null} The parsed color or null if invalid.
 */
export function parseSyncColorString(colorValue: string): ColorType | null {
	const trimmedColor = colorValue.trim();
	if (!trimmedColor) return null;

	try {
		/** Try gradient first. */
		const linearMatch = trimmedColor.match(/linear-gradient\s*\(\s*(\d+)deg\s*,\s*(.+)\s*\)/);
		if (linearMatch) {
			const angle = Number(linearMatch[1]);
			const stops = parseGradientStops(linearMatch[2]);

			if (stops.length >= 2) {
				return buildGradientColorType({
					type: 'linear',
					angle,
					stops: stops.map((stop, index) => ({
						id: `stop-${index + 1}`,
						color: stop.color,
						position: stop.position,
					})),
				});
			}
		}

		const radialMatch = trimmedColor.match(/radial-gradient\s*\(\s*circle\s*,\s*(.+)\s*\)/);
		if (radialMatch) {
			const stops = parseGradientStops(radialMatch[1]);
			if (stops.length >= 2) {
				return buildGradientColorType({
					type: 'radial',
					angle: 90,
					stops: stops.map((stop, index) => ({
						id: `stop-${index + 1}`,
						color: stop.color,
						position: stop.position,
					})),
				});
			}
		}

		const conicMatch = trimmedColor.match(/conic-gradient\s*\(\s*from\s+(\d+)deg\s*,\s*(.+)\s*\)/);
		if (conicMatch) {
			const angle = Number(conicMatch[1]);
			const stops = parseGradientStops(conicMatch[2]);

			if (stops.length >= 2) {
				return buildGradientColorType({
					type: 'conic',
					angle,
					stops: stops.map((stop, index) => ({
						id: `stop-${index + 1}`,
						color: stop.color,
						position: stop.position,
					})),
				});
			}
		}

		/** Try solid colors. */
		const solid = parseSolidColorString(trimmedColor);
		return solid;
	} catch {
		return null;
	}
}

/**
 * @description Parses gradient stops from a comma-separated string (e.g. "#fff 0%, #000 100%").
 * @param {string} stopsString - The stops string.
 * @returns {Array<{ color: string; position: number }>} The gradient stops.
 */
function parseGradientStops(stopsString: string): Array<{ color: string; position: number }> {
	const stops: Array<{ color: string; position: number }> = [];
	const parts = stopsString.split(',');

	for (const part of parts) {
		const trimmed = part.trim();
		const positionMatch = trimmed.match(/\s+(\d+(?:\.\d+)?)\s*%?\s*$/);
		if (positionMatch) {
			const color = trimmed.slice(0, trimmed.length - positionMatch[0].length).trim();
			stops.push({ color, position: Number(positionMatch[1]) });
		}
	}

	return stops;
}

/**
 * @description Parses a solid color string into SolidColorType.
 * @param {string} colorValue - The solid color string.
 * @returns {SolidColorType | null} The solid color return type or null if invalid.
 */
function parseSolidColorString(colorValue: string): SolidColorType | null {
	const trimmedColor = colorValue.trim();
	if (!trimmedColor) return null;

	/** HEX. */
	if (trimmedColor.startsWith('#')) {
		const parsed = parseHexColor(trimmedColor);
		return buildSolidColor({ hex: parsed.hex, alpha: parsed.alpha });
	}

	/** RGBA. */
	const rgbaMatch = trimmedColor.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
	if (rgbaMatch) {
		const rgb = {
			red: Number(rgbaMatch[1]),
			green: Number(rgbaMatch[2]),
			blue: Number(rgbaMatch[3]),
		};
		const alpha = Math.max(0, Math.min(1, Number(rgbaMatch[4])));
		return buildSolidColor({
			hex: rgbToHex({ rgb, includeAlpha: false }),
			alpha,
		});
	}

	/** RGB. */
	const rgbMatch = trimmedColor.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
	if (rgbMatch) {
		const rgb = {
			red: Number(rgbMatch[1]),
			green: Number(rgbMatch[2]),
			blue: Number(rgbMatch[3]),
		};
		return buildSolidColor({
			hex: rgbToHex({ rgb, includeAlpha: false }),
			alpha: 1,
		});
	}

	/** HSLA. */
	const hslaMatch = trimmedColor.match(/hsla\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*([\d.]+)\s*\)/);
	if (hslaMatch) {
		const hsl = {
			hue: Number(hslaMatch[1]),
			saturation: Number(hslaMatch[2]),
			lightness: Number(hslaMatch[3]),
		};
		const alpha = Math.max(0, Math.min(1, Number(hslaMatch[4])));
		return buildSolidColor({
			hex: rgbToHex({ rgb: hslToRgb(hsl), includeAlpha: false }),
			alpha,
		});
	}

	/** HSL. */
	const hslMatch = trimmedColor.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/);
	if (hslMatch) {
		const hsl = {
			hue: Number(hslMatch[1]),
			saturation: Number(hslMatch[2]),
			lightness: Number(hslMatch[3]),
		};
		return buildSolidColor({
			hex: rgbToHex({ rgb: hslToRgb(hsl), includeAlpha: false }),
			alpha: 1,
		});
	}

	return null;
}

/**
 * @description Converts HSL to RGB.
 * @param {HSL} hsl - The HSL values.
 * @returns {RGB} The RGB values.
 */
export function hslToRgb(hsl: HSL): RGB {
	/** Convert the hue, saturation, and lightness values to percentages. */
	const hue = hsl.hue / 360;
	const saturation = hsl.saturation / 100;
	const lightness = hsl.lightness / 100;

	/** If the saturation is 0, return the lightness value. */
	if (saturation === 0) {
		const value = Math.round(lightness * 255);
		return { red: value, green: value, blue: value };
	}

	const hueToRgbComponent = ({
		minComponent,
		maxComponent,
		hueComponent,
	}: {
		minComponent: number;
		maxComponent: number;
		hueComponent: number;
	}): number => {
		let adjustedHue = hueComponent;
		if (adjustedHue < 0) adjustedHue += 1;
		if (adjustedHue > 1) adjustedHue -= 1;
		if (adjustedHue < 1 / 6) return minComponent + (maxComponent - minComponent) * 6 * adjustedHue;
		if (adjustedHue < 1 / 2) return maxComponent;
		if (adjustedHue < 2 / 3) return minComponent + (maxComponent - minComponent) * (2 / 3 - adjustedHue) * 6;
		return minComponent;
	};

	/** Calculate the chroma sum and minimum component for HSL to RGB conversion. */
	const chromaSum = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
	const minComponent = 2 * lightness - chromaSum;

	/** Return the RGB values. */
	return {
		red: Math.round(hueToRgbComponent({ minComponent, maxComponent: chromaSum, hueComponent: hue + 1 / 3 }) * 255),
		green: Math.round(hueToRgbComponent({ minComponent, maxComponent: chromaSum, hueComponent: hue }) * 255),
		blue: Math.round(hueToRgbComponent({ minComponent, maxComponent: chromaSum, hueComponent: hue - 1 / 3 }) * 255),
	};
}

/**
 * @description Builds a hex color string with optional alpha.
 * @param {object} props - The parameters.
 * @param {string} props.hex - The 6-digit hex color.
 * @param {number} props.alpha - Alpha 0–1.
 * @returns {string} Hex string (#rrggbb or #rrggbbaa).
 */
export function hexWithAlpha({ hex, alpha }: { hex: string; alpha: number }): string {
	const sixDigit = hex.replace(/^#/, '').trim().slice(0, 6).padEnd(6, '0');
	if (alpha >= 1) return `#${sixDigit}`;
	const alphaHex = Math.round(alpha * 255)
		.toString(16)
		.padStart(2, '0');
	return `#${sixDigit}${alphaHex}`;
}

/**
 * @description Converts HSV to RGB.
 * @param {HSV} hsv - The HSV values.
 * @returns {RGB} The RGB values.
 */
export function hsvToRgb(hsv: HSV): RGB {
	/** Convert the hue, saturation, and value values to percentages. */
	const hue = hsv.hue / 360;
	const saturation = hsv.saturation / 100;
	const value = hsv.value / 100;

	/** If the saturation is 0, return the value value. */
	if (saturation === 0) {
		const component = Math.round(value * 255);
		return { red: component, green: component, blue: component };
	}

	/** Calculate the hue index and fractional part for HSV to RGB conversion. */
	const hueIndex = hue * 6;
	const hueSegment = Math.floor(hueIndex);
	const hueFraction = hueIndex - hueSegment;

	/** Calculate the intermediate RGB components from HSV. */
	const minComponent = value * (1 - saturation);
	const fractionalComponent = value * (1 - saturation * hueFraction);
	const fractionalComplement = value * (1 - saturation * (1 - hueFraction));

	let red = 0;
	let green = 0;
	let blue = 0;

	switch (hueSegment % 6) {
		case 0:
			red = value;
			green = fractionalComplement;
			blue = minComponent;
			break;
		case 1:
			red = fractionalComponent;
			green = value;
			blue = minComponent;
			break;
		case 2:
			red = minComponent;
			green = value;
			blue = fractionalComplement;
			break;
		case 3:
			red = minComponent;
			green = fractionalComponent;
			blue = value;
			break;
		case 4:
			red = fractionalComplement;
			green = minComponent;
			blue = value;
			break;
		case 5:
			red = value;
			green = minComponent;
			blue = fractionalComponent;
			break;
	}

	return {
		red: Math.round(red * 255),
		green: Math.round(green * 255),
		blue: Math.round(blue * 255),
	};
}

/**
 * @description Converts RGB to hex string.
 * @param {object} props - The parameters.
 * @param {RGB} props.rgb - The RGB values.
 * @param {boolean} props.includeAlpha - Whether to include alpha.
 * @returns {string} The hex string.
 */
export function rgbToHex({ rgb, includeAlpha = false }: { rgb: RGB; includeAlpha?: boolean }): string {
	/** Convert the red, green, and blue values to hex strings and pad them to 2 digits. */
	const red = Math.round(Math.max(0, Math.min(255, rgb.red)))
		.toString(16)
		.padStart(2, '0');
	const green = Math.round(Math.max(0, Math.min(255, rgb.green)))
		.toString(16)
		.padStart(2, '0');
	const blue = Math.round(Math.max(0, Math.min(255, rgb.blue)))
		.toString(16)
		.padStart(2, '0');

	/** Return the hex string. */
	return `#${red}${green}${blue}${includeAlpha ? 'ff' : ''}`;
}

/**
 * @description Formats a color value for display in the given format.
 * @param {object} props - The parameters.
 * @param {string} props.hex - The hex color.
 * @param {ColorFormatType} props.format - The target format.
 * @param {number} props.alpha - Alpha value 0–1.
 * @param {boolean} props.includeAlpha - Whether to include alpha in the output. When false, rgb/hsl use rgb()/hsl(), hex uses 6 digits.
 * @returns {string} The formatted string.
 */
export function formatColorForDisplay({
	hex,
	format,
	alpha,
	includeAlpha = true,
}: {
	hex: string;
	format: ColorFormatType;
	alpha: number;
	includeAlpha?: boolean;
}): string {
	const rgb = hexToRgb(hex);
	const sixDigitHex = rgbToHex({ rgb, includeAlpha: false });

	switch (format) {
		case 'hex':
			return includeAlpha && alpha < 1
				? `${sixDigitHex}${Math.round(alpha * 255)
						.toString(16)
						.padStart(2, '0')}`
				: sixDigitHex;
		case 'rgb':
			return includeAlpha
				? `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${alpha})`
				: `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
		case 'hsl': {
			const hsl = rgbToHsl(rgb);
			return includeAlpha
				? `hsla(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%, ${alpha})`
				: `hsl(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%)`;
		}
		case 'hsv': {
			const hsv = rgbToHsv(rgb);
			return `hsv(${hsv.hue}, ${hsv.saturation}%, ${hsv.value}%)`;
		}
		case 'cmyk': {
			const cmyk = rgbToCmyk(rgb);
			return `cmyk(${cmyk.cyan}%, ${cmyk.magenta}%, ${cmyk.yellow}%, ${cmyk.black}%)`;
		}
		default:
			return sixDigitHex;
	}
}

/**
 * @description Parses a color string into hex and alpha.
 * @param {object} props - The parameters.
 * @param {string} props.value - The input string.
 * @param {ColorFormatType} props.format - The expected format.
 * @returns {{ hex: string; alpha: number } | null} Parsed color or null if invalid.
 */
export function parseColorInput({
	value,
	format,
}: {
	value: string;
	format: ColorFormatType;
}): { hex: string; alpha: number } | null {
	const trimmed = value.trim();
	if (!trimmed) return null;

	try {
		switch (format) {
			case 'hex': {
				const normalized = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
				if (!/^[0-9a-fA-F]{3,8}$/.test(normalized)) return null;

				const rgb = hexToRgb(trimmed);
				const alpha =
					normalized.length === 8 ? Math.max(0, Math.min(1, parseInt(normalized.slice(6, 8), 16) / 255)) : 1;

				return { hex: rgbToHex({ rgb, includeAlpha: false }), alpha };
			}
			case 'rgb': {
				const rgbaMatch = trimmed.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
				if (rgbaMatch) {
					const rgb = {
						red: Math.round(Number(rgbaMatch[1])),
						green: Math.round(Number(rgbaMatch[2])),
						blue: Math.round(Number(rgbaMatch[3])),
					};
					const alpha = Math.max(0, Math.min(1, Number(rgbaMatch[4])));
					return { hex: rgbToHex({ rgb, includeAlpha: false }), alpha };
				}

				const rgbMatch = trimmed.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
				if (!rgbMatch) return null;

				const rgb = {
					red: Math.round(Number(rgbMatch[1])),
					green: Math.round(Number(rgbMatch[2])),
					blue: Math.round(Number(rgbMatch[3])),
				};
				return { hex: rgbToHex({ rgb, includeAlpha: false }), alpha: 1 };
			}
			case 'hsl': {
				const hslaMatch = trimmed.match(/hsla\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*([\d.]+)\s*\)/);
				if (hslaMatch) {
					const hsl = {
						hue: Number(hslaMatch[1]),
						saturation: Number(hslaMatch[2]),
						lightness: Number(hslaMatch[3]),
					};
					const alpha = Math.max(0, Math.min(1, Number(hslaMatch[4])));
					return { hex: rgbToHex({ rgb: hslToRgb(hsl), includeAlpha: false }), alpha };
				}
				const hslMatch = trimmed.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/);
				if (!hslMatch) return null;

				const hsl = {
					hue: Number(hslMatch[1]),
					saturation: Number(hslMatch[2]),
					lightness: Number(hslMatch[3]),
				};
				return { hex: rgbToHex({ rgb: hslToRgb(hsl), includeAlpha: false }), alpha: 1 };
			}
			case 'hsv': {
				const hsvMatch = trimmed.match(/hsv\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/);
				if (!hsvMatch) return null;

				const hsv = {
					hue: Number(hsvMatch[1]),
					saturation: Number(hsvMatch[2]),
					value: Number(hsvMatch[3]),
				};
				return { hex: rgbToHex({ rgb: hsvToRgb(hsv), includeAlpha: false }), alpha: 1 };
			}
			case 'cmyk': {
				const cmykMatch = trimmed.match(/cmyk\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
				if (!cmykMatch) return null;

				const cmyk = {
					cyan: Number(cmykMatch[1]),
					magenta: Number(cmykMatch[2]),
					yellow: Number(cmykMatch[3]),
					black: Number(cmykMatch[4]),
				};
				return { hex: rgbToHex({ rgb: cmykToRgb(cmyk), includeAlpha: false }), alpha: 1 };
			}
			default:
				return null;
		}
	} catch {
		return null;
	}
}

/**
 * @description Converts CMYK to RGB.
 * @param {CMYK} cmyk - The CMYK values.
 * @returns {RGB} The RGB values.
 */
export function cmykToRgb(cmyk: CMYK): RGB {
	/** Convert the cyan, magenta, and yellow values to percentages. */
	const cyan = cmyk.cyan / 100;
	const magenta = cmyk.magenta / 100;
	const yellow = cmyk.yellow / 100;
	const black = cmyk.black / 100;

	/** Calculate the factor. */
	const factor = 1 - black;

	return {
		red: Math.round(255 * (1 - cyan) * factor),
		green: Math.round(255 * (1 - magenta) * factor),
		blue: Math.round(255 * (1 - yellow) * factor),
	};
}

/**
 * @description Computes position percent from click/drag coordinates.
 * @param {object} props - The parameters.
 * @param {number} props.clientX - Client X coordinate.
 * @param {DOMRect} props.rect - Container bounding rect.
 * @returns {number} Position 0–100.
 */
export function getPositionFromClientX({ clientX, rect }: { clientX: number; rect: DOMRect }): number {
	const position = ((clientX - rect.left) / rect.width) * 100;
	return Math.max(0, Math.min(100, position));
}

/**
 * @description Builds a CSS gradient string from gradient value.
 * @param {GradientColorType} gradient - The gradient value.
 * @returns {string} The CSS gradient string.
 */
export function gradientToCss(gradient: GradientColorType): string {
	const stops = gradient.stops ?? [];
	const stopsString = [...stops]
		.sort((a, b) => a.position - b.position)
		.map((stop) => `${stop.string} ${stop.position}%`)
		.join(', ');

	switch (gradient.type) {
		case 'linear':
			return `linear-gradient(${gradient.angle}deg, ${stopsString})`;
		case 'radial':
			return `radial-gradient(circle, ${stopsString})`;
		case 'conic':
			return `conic-gradient(from ${gradient.angle}deg, ${stopsString})`;
		default:
			return `linear-gradient(${gradient.angle}deg, ${stopsString})`;
	}
}
