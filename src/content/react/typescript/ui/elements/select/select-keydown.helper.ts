import { KeyboardEvent as ReactKeyboardEvent } from 'react';

// eslint-disable-next-line no-secrets/no-secrets
/**
 * @name selectItemOnKeyDownHelper
 * @description Handles arrow key navigation between select items. ArrowUp/ArrowDown navigates between select items, skipping disabled items.
 * @param {ReactKeyboardEvent<HTMLButtonElement>} event - The keyboard event.
 * @returns {void}
 */
export function selectItemOnKeyDownHelper(event: ReactKeyboardEvent<HTMLButtonElement>): void {
	const key = event.key;

	/** Handle ArrowUp and ArrowDown keys for navigation. */
	if (key === 'ArrowUp' || key === 'ArrowDown') {
		event.preventDefault();

		/** Find the select content container by traversing up from the current item. */
		const selectContainer = event.currentTarget.closest<HTMLDivElement>('[data-slot="select-content"]');
		if (!selectContainer) return;

		/** Get all select items within the select container. */
		const selectItems = Array.from(
			selectContainer.querySelectorAll<HTMLButtonElement>('[data-slot="select-item"]'),
		);

		if (selectItems.length === 0) return;

		/** Find the current item's index. */
		const currentIndex = selectItems.findIndex((item) => item === event.currentTarget);
		if (currentIndex === -1) return;

		/** Find the next enabled item in the direction of navigation. */
		let nextIndex = currentIndex;
		const direction = key === 'ArrowUp' ? -1 : 1;
		let attempts = 0;

		/** Loop through items to find the next enabled one, wrapping around if needed. */
		while (attempts < selectItems.length) {
			nextIndex += direction;

			/** Wrap around. */
			if (nextIndex < 0) nextIndex = selectItems.length - 1;
			if (nextIndex >= selectItems.length) nextIndex = 0;

			/** Check if this item is enabled. */
			if (!selectItems[nextIndex].disabled) {
				selectItems[nextIndex].focus();
				return;
			}

			attempts++;
		}
	}
}
