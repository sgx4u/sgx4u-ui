import { VirtualizerItemType } from './virtualizer.type';

/** Result of the sliding-window calculation for a virtualizer. */
export type VirtualizerRangeType = {
	/** Items that should be mounted for the current scroll window. */
	virtualItems: Array<VirtualizerItemType>;

	/** Total scrollable size of the track, in pixels. */
	totalSize: number;
};

/**
 * @description Builds the sliding window of virtual items for the current scroll position, including overscan on either end. When count is omitted, the track grows ahead of the scroll position so unknown-length collections can keep extending.
 * @param {object} props - The range parameters.
 * @param {number} [props.count] - Total number of logical items. Omit for an unbounded growing track.
 * @param {number} props.itemSize - Fixed size of each item along the scroll axis, in pixels.
 * @param {number} props.scrollOffset - Current scroll offset of the viewport.
 * @param {number} props.viewportSize - Visible size of the viewport along the scroll axis, in pixels.
 * @param {number} props.overscan - Extra items to include above and below the visible range.
 * @returns {VirtualizerRangeType} The mounted window and total track size.
 */
export function getVirtualizerRange({
	count,
	itemSize,
	scrollOffset,
	viewportSize,
	overscan,
}: {
	count?: number;
	itemSize: number;
	scrollOffset: number;
	viewportSize: number;
	overscan: number;
}): VirtualizerRangeType {
	if (itemSize <= 0) {
		return { virtualItems: [], totalSize: 0 };
	}

	if (count !== undefined && count <= 0) {
		return { virtualItems: [], totalSize: 0 };
	}

	/** Ensure the scroll offset is not negative. */
	const safeScrollOffset = Math.max(0, scrollOffset);
	const safeViewportSize = Math.max(0, viewportSize);

	/** Calculate the start and end indices of the visible items. */
	const visibleStartIndex = Math.floor(safeScrollOffset / itemSize);
	const visibleEndIndex = Math.ceil((safeScrollOffset + safeViewportSize) / itemSize) - 1;

	/** Calculate the start and end indices of the virtual items. */
	const startIndex = Math.max(0, visibleStartIndex - overscan);
	const unboundedEndIndex = Math.max(startIndex, visibleEndIndex + overscan);
	const endIndex = count === undefined ? unboundedEndIndex : Math.min(count - 1, unboundedEndIndex);

	/** If the end index is less than the start index, return an empty array. */
	if (endIndex < startIndex) {
		return { virtualItems: [], totalSize: count === undefined ? 0 : count * itemSize };
	}

	/** Create the virtual items. */
	const virtualItems = Array.from({ length: endIndex - startIndex + 1 }, (_, offset) => {
		const index = startIndex + offset;
		const start = index * itemSize;
		return { index, start, size: itemSize, end: start + itemSize };
	});

	/** Known length uses an exact track; unknown length keeps overscan room past the window so scrolling can continue. */
	const totalSize = count === undefined ? (endIndex + 1 + overscan) * itemSize : count * itemSize;

	return { virtualItems, totalSize };
}
