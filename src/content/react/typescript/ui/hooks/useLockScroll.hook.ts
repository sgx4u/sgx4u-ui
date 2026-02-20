import { useEffect, useRef } from 'react';

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

/**
 * @description Locks body scroll while preserving sticky positioning and preventing layout shift. If you want to lock scroll of a specific element, then modify the code and instead of targeting the body, target the element itself.
 * @param {boolean} active - Whether to lock scroll.
 * @returns {void}
 */
export function useLockScroll(active: boolean): void {
	/** Store scroll position to restore later. */
	const scrollPositionRef = useRef<number | null>(null);

	useEffect(() => {
		if (!active) {
			/** Restore scroll position when unlocking. */
			if (scrollPositionRef.current !== null) {
				window.scrollTo(0, scrollPositionRef.current);
				scrollPositionRef.current = null;
			}
			return;
		}

		/** Store current scroll position. */
		scrollPositionRef.current = window.scrollY;

		/** Store original styles. */
		const originalBodyPosition = document.body.style.position;
		const originalBodyTop = document.body.style.top;
		const originalBodyLeft = document.body.style.left;
		const originalBodyRight = document.body.style.right;
		const originalBodyWidth = document.body.style.width;
		const originalBodyOverflow = document.body.style.overflow;
		const originalBodyPaddingRight = document.body.style.paddingRight;

		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

		/** Lock scroll without layout shift. */
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollPositionRef.current}px`;
		document.body.style.left = '0';
		document.body.style.right = '0';
		document.body.style.width = '100%';
		document.body.style.overflow = 'hidden';
		if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

		const preventScroll = (event: WheelEvent | TouchEvent): void => {
			if (isWithinFloatingContent(event.target)) return;
			event.preventDefault();
		};

		const preventScrollByKeyboard = (event: KeyboardEvent): void => {
			if (!SCROLL_KEYS_TO_BLOCK.has(event.key)) return;
			if (isWithinFloatingContent(event.target)) return;
			event.preventDefault();
		};

		window.addEventListener('wheel', preventScroll, { passive: false });
		window.addEventListener('touchmove', preventScroll, { passive: false });
		window.addEventListener('keydown', preventScrollByKeyboard);

		return (): void => {
			/** Remove scroll event listeners. */
			window.removeEventListener('wheel', preventScroll);
			window.removeEventListener('touchmove', preventScroll);
			window.removeEventListener('keydown', preventScrollByKeyboard);

			/** Restore original inline styles. */
			document.body.style.position = originalBodyPosition;
			document.body.style.top = originalBodyTop;
			document.body.style.left = originalBodyLeft;
			document.body.style.right = originalBodyRight;
			document.body.style.width = originalBodyWidth;
			document.body.style.overflow = originalBodyOverflow;
			document.body.style.paddingRight = originalBodyPaddingRight;

			/** Restore scroll position. */
			const lockedTop = Number.parseInt(originalBodyTop || '0', 10);
			const restoredScrollY = Number.isNaN(lockedTop) ? (scrollPositionRef.current ?? 0) : Math.abs(lockedTop);

			window.scrollTo(0, restoredScrollY);
			scrollPositionRef.current = null;
		};
	}, [active]);
}

/**
 * @description Checks if an element or any of its parent elements has the data-category="floating-content" attribute.
 * @param {EventTarget | null} element - The element to check.
 * @returns {boolean} True if the element or any of its parent elements has the data-category="floating-content" attribute, false otherwise.
 */
function isWithinFloatingContent(element: EventTarget | null): boolean {
	if (!(element instanceof Element)) return false;
	return element.closest('[data-category="floating-content"]') !== null;
}
