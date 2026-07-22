import { useEffect } from 'react';

/** Keys that cause page-level scrolling, blocked while scroll lock is active. Defined once at module level to avoid re-allocation on every keydown event. */
const SCROLL_KEYS_TO_BLOCK = new Set([
	'ArrowUp',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	' ',
	'PageUp',
	'PageDown',
	'Home',
	'End',
]);

/** Snapshot of the state captured when the first lock engages, restored when the last lock releases. */
type LockedStateType = {
	/** Scroll position to restore when the last lock releases. */
	scrollPosition: number;
	/** Original inline body styles to restore. */
	bodyStyles: {
		position: string;
		top: string;
		left: string;
		right: string;
		width: string;
		overflow: string;
		paddingRight: string;
	};
};

/** Number of active scroll locks. The body stays locked while this is greater than zero. */
let activeLockCount = 0;

/** State captured when the first lock engages. Null while no lock is active. */
let lockedState: LockedStateType | null = null;

/**
 * @description Checks if an element or any of its parent elements has the data-category="floating-content" attribute.
 * @param {EventTarget | null} element - The element to check.
 * @returns {boolean} True if the element or any of its parent elements is floating content, false otherwise.
 */
function isWithinFloatingContent(element: EventTarget | null): boolean {
	if (!(element instanceof Element)) return false;
	return element.closest('[data-category="floating-content"]') !== null;
}

/**
 * @description Prevents wheel and touch scrolling unless the event originates from floating content.
 * @param {WheelEvent | TouchEvent} event - The scroll event to evaluate.
 * @returns {void}
 */
function preventScroll(event: WheelEvent | TouchEvent): void {
	if (isWithinFloatingContent(event.target)) return;
	event.preventDefault();
}

/**
 * @description Prevents keyboard-driven scrolling unless the event originates from floating content.
 * @param {KeyboardEvent} event - The keyboard event to evaluate.
 * @returns {void}
 */
function preventScrollByKeyboard(event: KeyboardEvent): void {
	if (!SCROLL_KEYS_TO_BLOCK.has(event.key)) return;
	if (isWithinFloatingContent(event.target)) return;
	event.preventDefault();
}

/**
 * @description Engages the body scroll lock. Captures state and applies styles only on the first active lock.
 * @returns {void}
 */
function engageScrollLock(): void {
	activeLockCount += 1;
	if (activeLockCount > 1) return;

	const scrollPosition = window.scrollY;

	lockedState = {
		scrollPosition,
		bodyStyles: {
			position: document.body.style.position,
			top: document.body.style.top,
			left: document.body.style.left,
			right: document.body.style.right,
			width: document.body.style.width,
			overflow: document.body.style.overflow,
			paddingRight: document.body.style.paddingRight,
		},
	};

	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

	/** Lock scroll without layout shift. */
	document.body.style.position = 'fixed';
	document.body.style.top = `-${scrollPosition}px`;
	document.body.style.left = '0';
	document.body.style.right = '0';
	document.body.style.width = '100%';
	document.body.style.overflow = 'hidden';
	if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

	window.addEventListener('wheel', preventScroll, { passive: false });
	window.addEventListener('touchmove', preventScroll, { passive: false });
	window.addEventListener('keydown', preventScrollByKeyboard);
}

/**
 * @description Releases the body scroll lock. Restores state and styles only when the last active lock is released.
 * @returns {void}
 */
function releaseScrollLock(): void {
	if (activeLockCount === 0) return;

	activeLockCount -= 1;
	if (activeLockCount > 0 || !lockedState) return;

	window.removeEventListener('wheel', preventScroll);
	window.removeEventListener('touchmove', preventScroll);
	window.removeEventListener('keydown', preventScrollByKeyboard);

	const { scrollPosition, bodyStyles } = lockedState;

	/** Restore original inline styles. */
	document.body.style.position = bodyStyles.position;
	document.body.style.top = bodyStyles.top;
	document.body.style.left = bodyStyles.left;
	document.body.style.right = bodyStyles.right;
	document.body.style.width = bodyStyles.width;
	document.body.style.overflow = bodyStyles.overflow;
	document.body.style.paddingRight = bodyStyles.paddingRight;

	window.scrollTo(0, scrollPosition);
	lockedState = null;
}

/**
 * @description Locks body scroll while preserving sticky positioning and preventing layout shift. Reference counted, so nested or simultaneous locks engage the body once and release it once. To lock a specific element instead of the body, modify the code to target that element.
 * @param {boolean} active - Whether to lock scroll.
 * @returns {void}
 */
export function useLockScroll(active: boolean): void {
	useEffect(() => {
		if (!active) return;
		engageScrollLock();
		return (): void => releaseScrollLock();
	}, [active]);
}
