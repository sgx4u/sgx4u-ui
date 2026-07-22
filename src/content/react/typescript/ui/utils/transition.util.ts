/**
 * @description Ease-in-out cubic easing function. Produces a smooth, natural feel compared to linear interpolation.
 * @param {number} ratio - A value in [0, 1] representing linear animation progress.
 * @returns {number} The eased value in [0, 1].
 */
export function easeInOutCubic(ratio: number): number {
	return ratio < 0.5 ? 4 * ratio ** 3 : 1 - (-2 * ratio + 2) ** 3 / 2;
}
