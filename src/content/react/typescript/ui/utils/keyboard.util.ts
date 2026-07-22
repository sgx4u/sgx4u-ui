/** Direction to move within a keyboard-navigable collection. */
export type KeyboardNavigationDirectionType = 'next' | 'previous' | 'first' | 'last';

/**
 * @description Determines whether a key should activate a control, matching native button behaviour (Enter or Space).
 * @param {string} key - The keyboard event key.
 * @returns {boolean} True when the key is Enter or Space.
 */
export function isActivationKey(key: string): boolean {
	return key === 'Enter' || key === ' ' || key === 'Spacebar';
}

/**
 * @description Computes the next index within a collection for keyboard navigation, with optional wrap-around.
 * @param {object} props - The navigation parameters.
 * @param {KeyboardNavigationDirectionType} props.direction - The direction to move.
 * @param {number} props.currentIndex - The currently active index (-1 when nothing is active).
 * @param {number} props.itemCount - The total number of items.
 * @param {boolean} [props.loop] - Whether to wrap around the edges. Default - true.
 * @returns {number} The next index, or -1 when there are no items.
 */
export function getNextNavigationIndex({
	direction,
	currentIndex,
	itemCount,
	loop = true,
}: {
	direction: KeyboardNavigationDirectionType;
	currentIndex: number;
	itemCount: number;
	loop?: boolean;
}): number {
	if (itemCount <= 0) return -1;

	if (direction === 'first') return 0;
	if (direction === 'last') return itemCount - 1;

	const step = direction === 'next' ? 1 : -1;
	const nextIndex = currentIndex + step;

	if (nextIndex < 0) return loop ? itemCount - 1 : 0;
	if (nextIndex >= itemCount) return loop ? 0 : itemCount - 1;
	return nextIndex;
}

/**
 * @description Reports whether an element is disabled via the disabled property or the aria-disabled attribute.
 * @param {HTMLElement} element - The element to check.
 * @returns {boolean} True when the element is disabled.
 */
export function isElementDisabled(element: HTMLElement): boolean {
	return (element as HTMLButtonElement).disabled === true || element.getAttribute('aria-disabled') === 'true';
}

/**
 * @description Moves DOM focus to the next element in a collection based on a direction, skipping disabled elements and optionally wrapping around.
 * @param {object} props - The focus movement parameters.
 * @param {Array<HTMLElement>} props.elements - The navigable elements in DOM order.
 * @param {Element | null} props.currentElement - The currently focused element, if any.
 * @param {KeyboardNavigationDirectionType} props.direction - The direction to move.
 * @param {boolean} [props.loop] - Whether to wrap around the edges. Default - true.
 * @param {boolean} [props.skipDisabled] - Whether to skip disabled elements. Default - true.
 * @returns {HTMLElement | null} The element that received focus, or null when none could be focused.
 */
export function moveFocusByDirection({
	elements,
	currentElement,
	direction,
	loop = true,
	skipDisabled = true,
}: {
	elements: Array<HTMLElement>;
	currentElement: Element | null;
	direction: KeyboardNavigationDirectionType;
	loop?: boolean;
	skipDisabled?: boolean;
}): HTMLElement | null {
	if (elements.length === 0) return null;

	const currentIndex = currentElement ? elements.indexOf(currentElement as HTMLElement) : -1;

	/** Subsequent steps continue linearly while searching for the first eligible element. */
	const stepDirection: KeyboardNavigationDirectionType =
		direction === 'previous' || direction === 'last' ? 'previous' : 'next';

	let candidateIndex = getNextNavigationIndex({ direction, currentIndex, itemCount: elements.length, loop });

	for (let attempts = 0; attempts < elements.length; attempts++) {
		const candidate = elements[candidateIndex];

		if (!skipDisabled || !isElementDisabled(candidate)) {
			candidate.focus();
			return candidate;
		}

		candidateIndex = getNextNavigationIndex({
			direction: stepDirection,
			currentIndex: candidateIndex,
			itemCount: elements.length,
			loop: true,
		});
	}

	return null;
}
