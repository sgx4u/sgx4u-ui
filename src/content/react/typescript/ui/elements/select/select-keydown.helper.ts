import { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { moveFocusByDirection } from '../../utils/keyboard.util';

/**
 * @description Handles arrow key navigation between select items. ArrowUp/ArrowDown navigates between select items, skipping disabled items.
 * @param {ReactKeyboardEvent<HTMLButtonElement>} event - The keyboard event.
 * @returns {void}
 */
export function selectItemOnKeyDownHelper(event: ReactKeyboardEvent<HTMLButtonElement>): void {
	const key = event.key;
	if (key !== 'ArrowUp' && key !== 'ArrowDown') return;

	event.preventDefault();

	/** Find the select content container by traversing up from the current item. */
	const selectContainer = event.currentTarget.closest<HTMLDivElement>('[data-slot="select-content"]');
	if (!selectContainer) return;

	/** Get all select items within the select container. */
	const selectItems = Array.from(selectContainer.querySelectorAll<HTMLButtonElement>('[data-slot="select-item"]'));

	moveFocusByDirection({
		elements: selectItems,
		currentElement: event.currentTarget,
		direction: key === 'ArrowUp' ? 'previous' : 'next',
	});
}
