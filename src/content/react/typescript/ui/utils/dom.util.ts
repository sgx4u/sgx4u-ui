/** The computed block and inline padding of an element, in pixels. */
type ElementPaddingType = {
	/** Computed padding at the block start (top in horizontal writing modes). */
	paddingBlockStart: number;

	/** Computed padding at the block end (bottom in horizontal writing modes). */
	paddingBlockEnd: number;

	/** Computed padding at the inline start (left in LTR). */
	paddingInlineStart: number;

	/** Computed padding at the inline end (right in LTR). */
	paddingInlineEnd: number;
};

/**
 * @description Reads the block and inline padding of an element so animations can account for padding alongside size without layout gaps.
 * @param {HTMLElement} element - The element to read the padding from.
 * @returns {ElementPaddingType} The computed block and inline padding in pixels.
 */
export function getElementPadding(element: HTMLElement): ElementPaddingType {
	if (typeof window === 'undefined') {
		return { paddingBlockStart: 0, paddingBlockEnd: 0, paddingInlineStart: 0, paddingInlineEnd: 0 };
	}

	const computedStyle = window.getComputedStyle(element);
	const paddingBlockStart = Number.parseFloat(computedStyle.getPropertyValue('padding-block-start')) || 0;
	const paddingBlockEnd = Number.parseFloat(computedStyle.getPropertyValue('padding-block-end')) || 0;
	const paddingInlineStart = Number.parseFloat(computedStyle.getPropertyValue('padding-inline-start')) || 0;
	const paddingInlineEnd = Number.parseFloat(computedStyle.getPropertyValue('padding-inline-end')) || 0;

	return { paddingBlockStart, paddingBlockEnd, paddingInlineStart, paddingInlineEnd };
}
