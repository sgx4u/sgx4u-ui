/** A page window entry: a page number or an ellipsis placeholder. */
export type PaginationWindowItemType = number | 'ellipsis';

/**
 * @description Builds a condensed list of page numbers with ellipses for pages far from the current page, always keeping the first, last, and pages around the current page visible.
 * @param {object} props - The pagination window parameters.
 * @param {number} props.page - The current active page (1-indexed).
 * @param {number} props.totalPages - The total number of pages.
 * @param {number} [props.siblingCount] - Number of pages to show on each side of the current page. Default - 1.
 * @returns {Array<PaginationWindowItemType>} The ordered list of page numbers and ellipsis markers.
 */
export function getPaginationWindow({
	page,
	totalPages,
	siblingCount = 1,
}: {
	page: number;
	totalPages: number;
	siblingCount?: number;
}): Array<PaginationWindowItemType> {
	const totalVisible = siblingCount * 2 + 5;
	if (totalPages <= totalVisible) return Array.from({ length: totalPages }, (_, index) => index + 1);

	const leftSibling = Math.max(page - siblingCount, 1);
	const rightSibling = Math.min(page + siblingCount, totalPages);

	const showLeftEllipsis = leftSibling > 2;
	const showRightEllipsis = rightSibling < totalPages - 1;

	const items: Array<PaginationWindowItemType> = [1];

	if (showLeftEllipsis) items.push('ellipsis');
	else for (let pageNumber = 2; pageNumber < leftSibling; pageNumber++) items.push(pageNumber);

	for (let pageNumber = leftSibling; pageNumber <= rightSibling; pageNumber++) {
		if (pageNumber !== 1 && pageNumber !== totalPages) items.push(pageNumber);
	}

	if (showRightEllipsis) items.push('ellipsis');
	else for (let pageNumber = rightSibling + 1; pageNumber < totalPages; pageNumber++) items.push(pageNumber);

	items.push(totalPages);

	return items;
}

/**
 * @description Parses a typed page value and clamps it into the valid page range.
 * @param {object} props - The parse parameters.
 * @param {string} props.value - The raw input value.
 * @param {number} props.totalPages - The total number of pages.
 * @returns {number | undefined} A valid 1-indexed page number, or undefined when the value is not numeric.
 */
export function resolvePaginationPageNumber({
	value,
	totalPages,
}: {
	value: string;
	totalPages: number;
}): number | undefined {
	if (totalPages < 1) return undefined;

	const parsed = Number.parseInt(value.trim(), 10);
	if (!Number.isFinite(parsed)) return undefined;

	return Math.min(totalPages, Math.max(1, parsed));
}
