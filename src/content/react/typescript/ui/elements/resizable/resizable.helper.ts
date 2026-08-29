/**
 * @description Converts a pointer movement in pixels to a percentage of the group's total size along its resize axis.
 * @param {object} props - The conversion parameters.
 * @param {number} props.deltaPixels - The pointer movement in pixels.
 * @param {number} props.groupSizePixels - The total size of the group along the resize axis, in pixels.
 * @returns {number} The equivalent movement expressed as a percentage.
 */
export function pixelsToPercentage({
	deltaPixels,
	groupSizePixels,
}: {
	deltaPixels: number;
	groupSizePixels: number;
}): number {
	if (groupSizePixels <= 0) return 0;
	return (deltaPixels / groupSizePixels) * 100;
}

/**
 * @description Applies a delta to a pair of adjacent panel sizes while keeping both within their min/max bounds and their combined total unchanged.
 * @param {object} props - The resize parameters.
 * @param {number} props.previousSize - The current size of the panel before the handle.
 * @param {number} props.nextSize - The current size of the panel after the handle.
 * @param {number} props.deltaPercentage - The requested size change, in percentage points, applied to the previous panel.
 * @param {number} props.previousMin - Minimum size of the previous panel.
 * @param {number} props.previousMax - Maximum size of the previous panel.
 * @param {number} props.nextMin - Minimum size of the next panel.
 * @param {number} props.nextMax - Maximum size of the next panel.
 * @returns {{ previousSize: number; nextSize: number } | null} The clamped sizes, or null when nothing changes.
 */
export function resizeAdjacentPanelPair({
	previousSize,
	nextSize,
	deltaPercentage,
	previousMin,
	previousMax,
	nextMin,
	nextMax,
}: {
	previousSize: number;
	nextSize: number;
	deltaPercentage: number;
	previousMin: number;
	previousMax: number;
	nextMin: number;
	nextMax: number;
}): { previousSize: number; nextSize: number } | null {
	/** Clamp the requested delta so neither panel exceeds its own bounds. */
	const maxIncrease = Math.min(previousMax - previousSize, nextSize - nextMin);
	const maxDecrease = Math.min(previousSize - previousMin, nextMax - nextSize);
	const clampedDelta = Math.max(-maxDecrease, Math.min(maxIncrease, deltaPercentage));

	if (clampedDelta === 0) return null;

	return {
		previousSize: previousSize + clampedDelta,
		nextSize: nextSize - clampedDelta,
	};
}
