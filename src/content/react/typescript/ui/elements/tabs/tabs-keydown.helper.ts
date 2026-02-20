import { KeyboardEvent as ReactKeyboardEvent } from 'react';

// eslint-disable-next-line no-secrets/no-secrets
/**
 * @description Handles keyboard navigation and interaction. ArrowLeft/ArrowRight navigates between tabs items.
 * @param {ReactKeyboardEvent<HTMLButtonElement>} event - The keyboard event.
 * @returns {void}
 */
export function tabsOnKeyDownHelper(event: ReactKeyboardEvent<HTMLButtonElement>): void {
	const key = event.key;

	/** Handle ArrowLeft and ArrowRight keys for navigation. */
	if (key === 'ArrowLeft' || key === 'ArrowRight') {
		event.preventDefault();

		/** Find the tabs container by traversing up from the current trigger. */
		const tabsContainer = event.currentTarget.closest<HTMLDivElement>('[data-slot="tabs"]');
		if (!tabsContainer) return;

		/** Get all tabs triggers within the tabs container. */
		const triggers = Array.from(tabsContainer.querySelectorAll<HTMLButtonElement>('[data-slot="tab-trigger"]'));

		if (triggers.length === 0) return;

		/** Find the current trigger's index. */
		const currentIndex = triggers.findIndex((trigger) => trigger === event.currentTarget);
		if (currentIndex === -1) return;

		/** Calculate the next index based on arrow direction. */
		let nextIndex: number;
		if (key === 'ArrowLeft') {
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

		/** Find the tabs container by traversing up from the current trigger. */
		const tabsContainer = event.currentTarget.closest<HTMLDivElement>('[data-slot="tabs"]');
		if (!tabsContainer) return;

		/** Get all tabs triggers within the tabs container. */
		const triggers = Array.from(tabsContainer.querySelectorAll<HTMLButtonElement>('[data-slot="tab-trigger"]'));

		if (triggers.length === 0) return;

		/** Focus the first or last trigger. */
		const targetTrigger = key === 'Home' ? triggers[0] : triggers[triggers.length - 1];
		targetTrigger?.focus();
		return;
	}
}
