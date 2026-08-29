/**
 * @description Computes the next slide index for a navigation step, optionally wrapping around the ends.
 * @param {object} props - The navigation parameters.
 * @param {number} props.currentIndex - The currently active slide index.
 * @param {number} props.slideCount - The total number of slides.
 * @param {1 | -1} props.step - The direction to move: 1 for next, -1 for previous.
 * @param {boolean} props.loop - Whether to wrap around the ends.
 * @returns {number} The resulting slide index, clamped within bounds when loop is false.
 */
export function getNextSlideIndex({
	currentIndex,
	slideCount,
	step,
	loop,
}: {
	currentIndex: number;
	slideCount: number;
	step: 1 | -1;
	loop: boolean;
}): number {
	if (slideCount <= 0) return 0;

	const nextIndex = currentIndex + step;
	if (loop) return (nextIndex + slideCount) % slideCount;
	return Math.max(0, Math.min(slideCount - 1, nextIndex));
}

/**
 * @description Maps a logical slide index to a visual track index when edge clones are present.
 * @param {object} props - The mapping parameters.
 * @param {number} props.slideIndex - The logical slide index.
 * @param {boolean} props.loop - Whether the track includes cloned edge slides.
 * @param {number} props.slideCount - The total number of real slides.
 * @returns {number} The track index used for transforms.
 */
export function getTrackIndexFromSlideIndex({
	slideIndex,
	loop,
	slideCount,
}: {
	slideIndex: number;
	loop: boolean;
	slideCount: number;
}): number {
	if (!loop || slideCount <= 1) return slideIndex;
	return slideIndex + 1;
}
