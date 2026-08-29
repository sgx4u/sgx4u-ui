import { KeyboardEvent as ReactKeyboardEvent } from 'react';

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
