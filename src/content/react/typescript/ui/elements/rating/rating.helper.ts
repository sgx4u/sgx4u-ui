/**
 * @description Resolves a rating value from a pointer position within a star item, supporting whole or half precision.
 * @param {object} props - The pointer resolution parameters.
 * @param {number} props.index - Zero-based index of the hovered or clicked star.
 * @param {number} props.clientX - Pointer X coordinate.
 * @param {HTMLElement} props.itemElement - The star item element used for geometry.
 * @param {1 | 0.5} props.precision - Smallest selectable increment.
 * @returns {number} The resolved rating value for that pointer position.
 */
export function resolveRatingValueFromPointer({
	index,
	clientX,
	itemElement,
	precision,
}: {
	index: number;
	clientX: number;
	itemElement: HTMLElement;
	precision: 1 | 0.5;
}): number {
	if (precision !== 0.5) return index + 1;

	const { left, width } = itemElement.getBoundingClientRect();
	const isLeftHalf = clientX - left < width / 2;
	return isLeftHalf ? index + 0.5 : index + 1;
}

/**
 * @description Steps a rating value by the given delta and clamps it to the valid range.
 * @param {object} props - The step parameters.
 * @param {number} props.value - The current rating value.
 * @param {number} props.delta - Amount to add (positive or negative).
 * @param {number} props.max - Maximum rating value.
 * @returns {number} The stepped and clamped rating value.
 */
export function stepRatingValue({ value, delta, max }: { value: number; delta: number; max: number }): number {
	return Math.max(0, Math.min(max, value + delta));
}
