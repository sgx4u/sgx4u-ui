import { useEffect, useRef, useState } from 'react';

/** Duration in milliseconds to wait after the last resize event before resetting resizeDirection to null. */
const RESIZE_DIRECTION_RESET_DELAY_MS = 200;

type WindowResizeHookReturnType = {
	/** The width of the window. */
	windowWidth: number;
	/** The height of the window. */
	windowHeight: number;
	/** The direction of the most recent window resize. Resets to null after the user stops resizing. */
	resizeDirection: 'shrinking' | 'expanding' | null;
	/** Check if the window size matches the given width and height. */
	isWindowSizeMatching: ({ width, height }: { width?: number; height?: number }) => boolean;
	/** Check if the media query matches the current viewport. */
	mediaQuery: (query: string) => boolean;
};

/**
 * @description Hook to track window dimensions, resize direction, and media query matching. The resizeDirection resets to null after the user stops resizing (after RESIZE_DIRECTION_RESET_DELAY_MS of inactivity).
 * @returns {WindowResizeHookReturnType} The window resize hook return type.
 */
export function useWindowResize(): WindowResizeHookReturnType {
	const [windowWidth, setWindowWidth] = useState<WindowResizeHookReturnType['windowWidth']>(() => {
		if (typeof window === 'undefined') return 0;
		return window.innerWidth;
	});
	const [windowHeight, setWindowHeight] = useState<WindowResizeHookReturnType['windowHeight']>(() => {
		if (typeof window === 'undefined') return 0;
		return window.innerHeight;
	});
	const [resizeDirection, setResizeDirection] = useState<WindowResizeHookReturnType['resizeDirection']>(null);

	/** Reference to the previous width, used to determine resize direction. */
	const previousWidthRef = useRef<number>(typeof window === 'undefined' ? 0 : window.innerWidth);

	/** Timer id for the debounced resizeDirection reset. */
	const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		let animationFrameId: number | null = null;

		/** Handle the resize event (batched per animation frame). */
		const handleResize = (): void => {
			if (animationFrameId !== null) return;

			animationFrameId = window.requestAnimationFrame(() => {
				animationFrameId = null;

				const currentWidth = window.innerWidth;
				const currentHeight = window.innerHeight;

				setWindowWidth(currentWidth);
				setWindowHeight(currentHeight);

				if (currentWidth < previousWidthRef.current) {
					setResizeDirection('shrinking');
				} else if (currentWidth > previousWidthRef.current) {
					setResizeDirection('expanding');
				}

				previousWidthRef.current = currentWidth;

				/** Reset resizeDirection to null after the user stops resizing. */
				if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
				resetTimerRef.current = setTimeout(() => {
					setResizeDirection(null);
					resetTimerRef.current = null;
				}, RESIZE_DIRECTION_RESET_DELAY_MS);
			});
		};

		/** Sync dimensions once on mount. */
		handleResize();

		window.addEventListener('resize', handleResize);
		return (): void => {
			window.removeEventListener('resize', handleResize);
			if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId);
			if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
		};
	}, []);

	const isWindowSizeMatching = ({ width, height }: { width?: number; height?: number }): boolean => {
		if (!width && !height) return false;
		if (width && height && windowWidth === width && windowHeight === height) return true;
		if (width && windowWidth === width) return true;
		if (height && windowHeight === height) return true;
		return false;
	};

	const mediaQuery = (query: string): boolean => {
		if (typeof window === 'undefined') return false;
		return window.matchMedia(query).matches;
	};

	return { windowWidth, windowHeight, resizeDirection, isWindowSizeMatching, mediaQuery };
}
