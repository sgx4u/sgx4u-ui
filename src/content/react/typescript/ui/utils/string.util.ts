import { BG_COLORS, BORDER_COLORS, TEXT_COLORS } from '../constants/color.constant';

/**
 * @description Converts a string to a stable non-negative integer using the djb2 hash algorithm. djb2 distributes output well even for short strings and anagrams, avoiding the collision problem of a simple character-code sum.
 * @param {string} value - The string to hash.
 * @returns {number} A stable non-negative integer derived from the string.
 */
export function stringToNumber(value: string): number {
	let hash = 5381;
	for (let i = 0; i < value.length; i++) {
		/** hash * 33 XOR char code — the djb2 formula. */
		hash = (hash * 33) ^ value.charCodeAt(i);
	}
	/** Force to unsigned 32-bit integer, then take absolute value. */
	return Math.abs(hash >>> 0);
}

/**
 * @description Converts a string or number to a Tailwind color class using a stable hash for even distribution across the color palette.
 * @param {object} props - The options for converting to a color.
 * @param {string | number} props.value - The string or number to convert to a color.
 * @param {'bg' | 'text' | 'border'} props.type - The type of color class to return.
 * @param {Array<string>} [props.colors] - Optional custom color palette to use instead of the built-in palettes.
 * @returns {string} The Tailwind color class.
 */
export function stringToColor({
	value,
	type,
	colors,
}: {
	value: string | number;
	type: 'bg' | 'text' | 'border';
	colors?: Array<string>;
}): string {
	const activeColors = colors ?? (type === 'bg' ? BG_COLORS : type === 'text' ? TEXT_COLORS : BORDER_COLORS);
	const numericValue = typeof value === 'string' ? stringToNumber(value) : Math.abs(value);

	const colorIndex = numericValue % activeColors.length;
	return activeColors[colorIndex];
}
