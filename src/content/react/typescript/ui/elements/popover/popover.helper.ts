import { PopoverAlignType, PopoverSideType } from './popover.type';

/**
 * @description Computes the left coordinate for the content based on align and alignOffset.
 * @param {object} props - The props object.
 * @param {number} props.triggerLeft - The left coordinate of the trigger.
 * @param {number} props.triggerRight - The right coordinate of the trigger.
 * @param {number} props.triggerWidth - The width of the trigger.
 * @param {number} props.contentWidth - The width of the content.
 * @param {PopoverAlignType} props.align - The alignment of the content.
 * @param {number} props.alignOffset - The offset of the content from the trigger.
 * @returns {number} The left coordinate for the content.
 */
function computeAlignLeft({
	triggerLeft,
	triggerRight,
	triggerWidth,
	contentWidth,
	align,
	alignOffset,
}: {
	triggerLeft: number;
	triggerRight: number;
	triggerWidth: number;
	contentWidth: number;
	align: PopoverAlignType;
	alignOffset: number;
}): number {
	switch (align) {
		case 'start':
			return triggerLeft + alignOffset;
		case 'center':
			return triggerLeft + triggerWidth / 2 - contentWidth / 2 + alignOffset;
		case 'end':
			return triggerRight - contentWidth - alignOffset;
	}
}

/**
 * @description Clamps a value between min and max.
 * @param {object} props - The props object.
 * @param {number} props.value - The value to clamp.
 * @param {number} props.min - The minimum value.
 * @param {number} props.max - The maximum value.
 * @returns {number} The clamped value.
 */
function clampNumber({ value, min, max }: { value: number; min: number; max: number }): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * @description Returns true if the content fits within the viewport on the given side of the trigger without overflowing, considering the window edge offset.
 * @param {object} props - The props object.
 * @param {DOMRect} props.triggerRect - The bounding rect of the trigger element.
 * @param {number} props.contentWidth - The measured width of the popover content.
 * @param {number} props.contentHeight - The measured height of the popover content.
 * @param {PopoverSideType} props.side - The candidate side to test.
 * @param {number} props.sideOffset - The gap between trigger and content.
 * @param {number} props.windowEdgeOffset - The minimum distance to keep from the viewport edge.
 * @returns {boolean} Whether the content fits on the given side.
 */
function hasRoomOnSide({
	triggerRect,
	contentWidth,
	contentHeight,
	side,
	sideOffset,
	windowEdgeOffset,
}: {
	triggerRect: DOMRect;
	contentWidth: number;
	contentHeight: number;
	side: PopoverSideType;
	sideOffset: number;
	windowEdgeOffset: number;
}): boolean {
	const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
	const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

	switch (side) {
		case 'bottom':
			return triggerRect.bottom + sideOffset + contentHeight + windowEdgeOffset <= viewportHeight;
		case 'top':
			return triggerRect.top - sideOffset - contentHeight - windowEdgeOffset >= 0;
		case 'right':
			return triggerRect.right + sideOffset + contentWidth + windowEdgeOffset <= viewportWidth;
		case 'left':
			return triggerRect.left - sideOffset - contentWidth - windowEdgeOffset >= 0;
	}
}

/** Maps each side to its opposite for auto-flip. */
const OPPOSITE_SIDE: Record<PopoverSideType, PopoverSideType> = {
	top: 'bottom',
	bottom: 'top',
	left: 'right',
	right: 'left',
};

/**
 * @description Computes the fixed-position coordinates for the popover content based on the trigger's rect, preferred side, align, and offsets. Automatically flips to the opposite side when there is insufficient room on the preferred side. Falls back to viewport clamping as a last resort.
 * @param {DOMRect} triggerRect - The bounding rect of the trigger.
 * @param {DOMRect} contentRect - The bounding rect of the content.
 * @param {PopoverSideType} preferredSide - The preferred side to render against.
 * @param {PopoverAlignType} align - The alignment of the content along the cross axis.
 * @param {number} sideOffset - The gap in pixels between the trigger and content.
 * @param {number} alignOffset - The offset in pixels along the alignment axis.
 * @param {number} windowEdgeOffset - The minimum distance in pixels from the viewport edge.
 * @returns {{ top: number; left: number; effectiveSide: PopoverSideType }} The position and the side actually used after auto-flip.
 */
export function computePopoverPosition(
	triggerRect: DOMRect,
	contentRect: DOMRect,
	preferredSide: PopoverSideType,
	align: PopoverAlignType,
	sideOffset: number,
	alignOffset: number,
	windowEdgeOffset: number,
): { top: number; left: number; effectiveSide: PopoverSideType } {
	const { width: contentWidth, height: contentHeight } = contentRect;
	const {
		top: triggerTop,
		bottom: triggerBottom,
		left: triggerLeft,
		right: triggerRight,
		width: triggerWidth,
		height: triggerHeight,
	} = triggerRect;

	const roomArgs = { triggerRect, contentWidth, contentHeight, sideOffset, windowEdgeOffset };

	/** Use the preferred side unless there is no room and the opposite side does have room. */
	const effectiveSide: PopoverSideType =
		hasRoomOnSide({ ...roomArgs, side: preferredSide }) ||
		!hasRoomOnSide({ ...roomArgs, side: OPPOSITE_SIDE[preferredSide] })
			? preferredSide
			: OPPOSITE_SIDE[preferredSide];

	let top = 0;
	let left = 0;

	switch (effectiveSide) {
		case 'bottom':
			top = triggerBottom + sideOffset;
			left = computeAlignLeft({ triggerLeft, triggerRight, triggerWidth, contentWidth, align, alignOffset });
			break;
		case 'top':
			top = triggerTop - contentHeight - sideOffset;
			left = computeAlignLeft({ triggerLeft, triggerRight, triggerWidth, contentWidth, align, alignOffset });
			break;
		case 'right':
			left = triggerRight + sideOffset;
			switch (align) {
				case 'start':
					top = triggerTop + alignOffset;
					break;
				case 'center':
					top = triggerTop + triggerHeight / 2 - contentHeight / 2 + alignOffset;
					break;
				case 'end':
					top = triggerBottom - contentHeight - alignOffset;
					break;
			}
			break;
		case 'left':
			left = triggerLeft - contentWidth - sideOffset;
			switch (align) {
				case 'start':
					top = triggerTop + alignOffset;
					break;
				case 'center':
					top = triggerTop + triggerHeight / 2 - contentHeight / 2 + alignOffset;
					break;
				case 'end':
					top = triggerBottom - contentHeight - alignOffset;
					break;
			}
			break;
	}

	const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
	const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

	return {
		top: clampNumber({ value: top, min: windowEdgeOffset, max: viewportHeight - contentHeight - windowEdgeOffset }),
		left: clampNumber({ value: left, min: windowEdgeOffset, max: viewportWidth - contentWidth - windowEdgeOffset }),
		effectiveSide,
	};
}

/**
 * @description Returns the Tailwind translate class for the closing/closed animation state based on side. The content starts offset toward the trigger and animates to its final position.
 * @param {PopoverSideType} side - The side the popover is anchored to.
 * @returns {string} The Tailwind translate class.
 */
export function getClosedTranslateClass(side: PopoverSideType): string {
	switch (side) {
		case 'bottom':
			return '-translate-y-1';
		case 'top':
			return 'translate-y-1';
		case 'right':
			return '-translate-x-1';
		case 'left':
			return 'translate-x-1';
	}
}
