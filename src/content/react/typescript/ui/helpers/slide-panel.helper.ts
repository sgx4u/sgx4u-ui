import { getElementPadding } from '../utils/dom.util';
import { easeInOutCubic } from '../utils/transition.util';

/** Extended HTMLElement that carries the in-flight rAF id so overlapping animations can be cancelled cleanly. */
type SlidePanelAnimationElement = HTMLElement & {
	__slidePanelRafId?: number;
};

/**
 * @description Animates a panel element open (slide down) or closed (slide up) using requestAnimationFrame with an ease-in-out cubic easing curve. Shared by Accordion and Collapsible.
 * @param {object} props - The animation props.
 * @param {HTMLElement} props.element - The content element to animate.
 * @param {number} props.speed - Duration of the animation in milliseconds. Pass 0 to skip animation.
 * @param {'down' | 'up'} props.action - 'down' expands the element; 'up' collapses it.
 * @returns {void}
 */
export function slidePanel({
	element,
	speed,
	action,
}: {
	element: HTMLElement;
	speed: number;
	action: 'down' | 'up';
}): void {
	const animatedElement = element as SlidePanelAnimationElement;

	/** Cancel any in-flight animation before starting a new one. */
	if (animatedElement.__slidePanelRafId !== undefined) {
		cancelAnimationFrame(animatedElement.__slidePanelRafId);
		animatedElement.__slidePanelRafId = undefined;
	}

	/** Skip animation when speed is zero (e.g. prefers-reduced-motion). */
	if (speed <= 0) {
		if (action === 'down') element.style.display = 'block';
		else element.style.display = 'none';
		return;
	}

	let height = element.scrollHeight;
	const padding = getElementPadding(element);

	if (action === 'down') {
		element.style.display = 'block';
		height = element.scrollHeight;
		element.style.overflow = 'hidden';
		element.style.height = '0px';
		element.style.setProperty('padding-block-start', '0px');
		element.style.setProperty('padding-block-end', '0px');
	} else {
		element.style.overflow = 'hidden';
		element.style.height = `${height}px`;
		element.style.setProperty('padding-block-start', `${padding.paddingBlockStart}px`);
		element.style.setProperty('padding-block-end', `${padding.paddingBlockEnd}px`);
	}

	let startTime: number | null = null;

	/**
	 * @description Per-frame animation step. Applies eased interpolation to height and padding.
	 * @param {number} timestamp - The DOMHighResTimeStamp provided by requestAnimationFrame.
	 * @returns {void}
	 */
	const step = (timestamp: number): void => {
		if (!startTime) startTime = timestamp;
		const elapsed = timestamp - startTime;
		const linearRatio = Math.min(elapsed / speed, 1);
		/** Apply ease-in-out cubic for a natural, professional feel. */
		const easedRatio = easeInOutCubic(linearRatio);

		if (action === 'down') {
			element.style.height = `${height * easedRatio}px`;
			element.style.setProperty('padding-block-start', `${padding.paddingBlockStart * easedRatio}px`);
			element.style.setProperty('padding-block-end', `${padding.paddingBlockEnd * easedRatio}px`);
		} else {
			const inverseRatio = 1 - easedRatio;
			element.style.height = `${height * inverseRatio}px`;
			element.style.setProperty('padding-block-start', `${padding.paddingBlockStart * inverseRatio}px`);
			element.style.setProperty('padding-block-end', `${padding.paddingBlockEnd * inverseRatio}px`);
		}

		if (elapsed < speed) {
			animatedElement.__slidePanelRafId = requestAnimationFrame(step);
		} else {
			/** Cleanup after animation completes. */
			if (action === 'down') {
				element.style.height = 'auto';
				element.style.overflow = '';
				element.style.removeProperty('padding-block-start');
				element.style.removeProperty('padding-block-end');
			} else {
				element.style.display = 'none';
				element.style.height = '';
				element.style.overflow = '';
				element.style.removeProperty('padding-block-start');
				element.style.removeProperty('padding-block-end');
			}

			animatedElement.__slidePanelRafId = undefined;
		}
	};

	animatedElement.__slidePanelRafId = requestAnimationFrame(step);
}
