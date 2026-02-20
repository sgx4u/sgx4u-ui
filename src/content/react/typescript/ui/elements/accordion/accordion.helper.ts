import { KeyboardEvent as ReactKeyboardEvent } from 'react';

/**
 * @description Reads the block padding of an element so the accordion animation can animate padding alongside height without layout gaps.
 * @param {HTMLElement} element - The element to read padding from.
 * @returns {{ paddingBlockStart: number; paddingBlockEnd: number }} The computed block padding in pixels.
 */
const getAccordionPadding = (element: HTMLElement): { paddingBlockStart: number; paddingBlockEnd: number } => {
	if (typeof window === 'undefined') return { paddingBlockStart: 0, paddingBlockEnd: 0 };

	const computedStyle = window.getComputedStyle(element);
	const paddingBlockStart = Number.parseFloat(computedStyle.getPropertyValue('padding-block-start')) || 0;
	const paddingBlockEnd = Number.parseFloat(computedStyle.getPropertyValue('padding-block-end')) || 0;

	return { paddingBlockStart, paddingBlockEnd };
};

/** Extended HTMLElement that carries the in-flight rAF id so overlapping animations can be cancelled cleanly. */
type AccordionAnimationElement = HTMLElement & {
	__accordionRafId?: number;
};

/**
 * @description Ease-in-out cubic easing function. Produces a smooth, natural feel compared to linear interpolation.
 * @param {number} ratio - A value in [0, 1] representing linear animation progress.
 * @returns {number} The eased value in [0, 1].
 */
function easeInOutCubic(ratio: number): number {
	return ratio < 0.5 ? 4 * ratio ** 3 : 1 - (-2 * ratio + 2) ** 3 / 2;
}

/**
 * @description Animates the accordion element open (slide down) or closed (slide up) using requestAnimationFrame with an ease-in-out cubic easing curve.
 * @param {object} props - The animation options.
 * @param {HTMLElement} props.element - The content element to animate.
 * @param {number} props.speed - Duration of the animation in milliseconds. Pass 0 to skip animation.
 * @param {'down' | 'up'} props.action - 'down' expands the element; 'up' collapses it.
 * @returns {void}
 */
export const slideAccordion = ({
	element,
	speed,
	action,
}: {
	element: HTMLElement;
	speed: number;
	action: 'down' | 'up';
}): void => {
	const animatedElement = element as AccordionAnimationElement;

	/** Cancel any in-flight animation before starting a new one. */
	if (animatedElement.__accordionRafId !== undefined) {
		cancelAnimationFrame(animatedElement.__accordionRafId);
		animatedElement.__accordionRafId = undefined;
	}

	/** Skip animation when speed is zero (e.g. prefers-reduced-motion). */
	if (speed <= 0) {
		if (action === 'down') element.style.display = 'block';
		else element.style.display = 'none';
		return;
	}

	let height = element.scrollHeight;
	const padding = getAccordionPadding(element);

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
			animatedElement.__accordionRafId = requestAnimationFrame(step);
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

			animatedElement.__accordionRafId = undefined;
		}
	};

	animatedElement.__accordionRafId = requestAnimationFrame(step);
};

// eslint-disable-next-line no-secrets/no-secrets
/**
 * @description Handles keyboard navigation and interaction. ArrowUp/ArrowDown navigates between accordion items.
 * @param {ReactKeyboardEvent<HTMLButtonElement>} event - The keyboard event.
 * @returns {void}
 */
export function accordionOnKeyDownHelper(event: ReactKeyboardEvent<HTMLButtonElement>): void {
	const key = event.key;

	/** Handle ArrowUp and ArrowDown keys for navigation. */
	if (key === 'ArrowUp' || key === 'ArrowDown') {
		event.preventDefault();

		/** Find the accordion container by traversing up from the current trigger. */
		const accordionContainer = event.currentTarget.closest<HTMLDivElement>('[data-slot="accordion"]');
		if (!accordionContainer) return;

		/** Get all accordion triggers within the accordion container. */
		const triggers = Array.from(
			accordionContainer.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]'),
		);

		if (triggers.length === 0) return;

		/** Find the current trigger's index. */
		const currentIndex = triggers.findIndex((trigger) => trigger === event.currentTarget);
		if (currentIndex === -1) return;

		/** Calculate the next index based on arrow direction. */
		let nextIndex: number;
		if (key === 'ArrowUp') {
			nextIndex = currentIndex > 0 ? currentIndex - 1 : triggers.length - 1;
		} else {
			nextIndex = currentIndex < triggers.length - 1 ? currentIndex + 1 : 0;
		}

		/** Focus the next/previous trigger. */
		const nextTrigger = triggers[nextIndex];
		if (nextTrigger) nextTrigger.focus();
		return;
	}

	if (key === 'Home' || key === 'End') {
		event.preventDefault();

		/** Find the accordion container by traversing up from the current trigger. */
		const accordionContainer = event.currentTarget.closest<HTMLDivElement>('[data-slot="accordion"]');
		if (!accordionContainer) return;

		/** Get all accordion triggers within the accordion container. */
		const triggers = Array.from(
			accordionContainer.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]'),
		);

		if (triggers.length === 0) return;

		/** Focus the first or last trigger. */
		const targetTrigger = key === 'Home' ? triggers[0] : triggers[triggers.length - 1];
		targetTrigger?.focus();
		return;
	}
}
