import { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { getElementPadding } from '../../utils/dom.util';
import { easeInOutCubic } from '../../utils/transition.util';

/** Extended HTMLElement that carries the in-flight rAF id so overlapping animations can be cancelled cleanly. */
type AccordionAnimationElement = HTMLElement & {
	__accordionRafId?: number;
};

/**
 * @description Animates the accordion element open (slide down) or closed (slide up) using requestAnimationFrame with an ease-in-out cubic easing curve.
 * @param {object} props - The animation props.
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

/**
 * @description Collects every accordion trigger that belongs to the same accordion as the given trigger.
 * @param {HTMLButtonElement} trigger - The trigger the keyboard event originated from.
 * @returns {Array<HTMLButtonElement>} The ordered list of triggers, or an empty array when none are found.
 */
function getAccordionTriggers(trigger: HTMLButtonElement): Array<HTMLButtonElement> {
	const accordionContainer = trigger.closest<HTMLDivElement>('[data-slot="accordion"]');
	if (!accordionContainer) return [];

	return Array.from(accordionContainer.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]'));
}

/**
 * @description Handles roving keyboard navigation between accordion triggers using ArrowUp, ArrowDown, Home, and End.
 * @param {ReactKeyboardEvent<HTMLButtonElement>} event - The keyboard event.
 * @returns {void}
 */
export function accordionOnKeyDownHelper(event: ReactKeyboardEvent<HTMLButtonElement>): void {
	const { key } = event;

	const isArrowNavigation = key === 'ArrowUp' || key === 'ArrowDown';
	const isEdgeNavigation = key === 'Home' || key === 'End';
	if (!isArrowNavigation && !isEdgeNavigation) return;

	event.preventDefault();

	const triggers = getAccordionTriggers(event.currentTarget);
	if (triggers.length === 0) return;

	const currentIndex = triggers.indexOf(event.currentTarget);
	const lastIndex = triggers.length - 1;

	/** Resolve the trigger index to move focus to based on the pressed key. */
	let nextIndex: number;
	if (key === 'Home') nextIndex = 0;
	else if (key === 'End') nextIndex = lastIndex;
	else if (key === 'ArrowUp') nextIndex = currentIndex > 0 ? currentIndex - 1 : lastIndex;
	else nextIndex = currentIndex < lastIndex ? currentIndex + 1 : 0;

	triggers[nextIndex]?.focus();
}
