/**
 * @description Clamps a number to a finite non-negative value. Returns 0 for NaN, Infinity, -Infinity, or any non-finite input. For all other values, returns the absolute value. This differs from Math.abs in that it treats non-finite inputs as 0 rather than propagating them, providing a safe default for layout and animation calculations.
 * @param {number} value - The value to clamp.
 * @returns {number} A finite non-negative number.
 */
export function absoluteNumber(value: number): number {
	if (!Number.isFinite(value)) return 0;
	return Math.abs(value);
}
