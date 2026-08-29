/**
 * @description Clamps a value between a minimum and maximum, then snaps it to the nearest step.
 * @param {object} props - The clamp parameters.
 * @param {number} props.value - The raw value.
 * @param {number} props.min - The minimum bound.
 * @param {number} props.max - The maximum bound.
 * @param {number} props.step - The step increment.
 * @returns {number} The clamped and stepped value.
 */
export function clampToStep({
	value,
	min,
	max,
	step,
}: {
	value: number;
	min: number;
	max: number;
	step: number;
}): number {
	const stepped = Math.round((value - min) / step) * step + min;
	return Math.max(min, Math.min(max, stepped));
}

/**
 * @description Derives a slider value from a pointer position along the track, accounting for orientation.
 * @param {object} props - The pointer parameters.
 * @param {number} props.clientPosition - The pointer clientX (horizontal) or clientY (vertical).
 * @param {DOMRect} props.trackRect - The bounding rect of the track element.
 * @param {'horizontal' | 'vertical'} props.orientation - The slider orientation.
 * @param {number} props.min - The minimum bound.
 * @param {number} props.max - The maximum bound.
 * @param {number} props.step - The step increment.
 * @returns {number} The value corresponding to the pointer position.
 */
export function getValueFromPointerPosition({
	clientPosition,
	trackRect,
	orientation,
	min,
	max,
	step,
}: {
	clientPosition: number;
	trackRect: DOMRect;
	orientation: 'horizontal' | 'vertical';
	min: number;
	max: number;
	step: number;
}): number {
	const ratio =
		orientation === 'horizontal'
			? (clientPosition - trackRect.left) / trackRect.width
			: 1 - (clientPosition - trackRect.top) / trackRect.height;

	const rawValue = min + Math.max(0, Math.min(1, ratio)) * (max - min);
	return clampToStep({ value: rawValue, min, max, step });
}
