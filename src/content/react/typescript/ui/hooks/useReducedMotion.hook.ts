import { useEffect, useState } from 'react';

/** Media query string for the prefers-reduced-motion user preference. */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * @description Reactively reads the user's prefers-reduced-motion preference. Returns true when the OS or browser is set to reduce motion (WCAG 2.3.3). Subscribes to changes so the value updates without a page reload when the user changes their system preference at runtime.
 * @returns {boolean} True if the user prefers reduced motion, false otherwise.
 */
export function useReducedMotion(): boolean {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
		if (typeof window === 'undefined') return false;
		return window.matchMedia(REDUCED_MOTION_QUERY).matches;
	});

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);

		const handleChange = (event: MediaQueryListEvent): void => {
			setPrefersReducedMotion(event.matches);
		};

		mediaQueryList.addEventListener('change', handleChange);
		return (): void => {
			mediaQueryList.removeEventListener('change', handleChange);
		};
	}, []);

	return prefersReducedMotion;
}
