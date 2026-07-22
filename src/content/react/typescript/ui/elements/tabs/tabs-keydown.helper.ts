import { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { KeyboardNavigationDirectionType, moveFocusByDirection } from '../../utils/keyboard.util';

/**
 * @description Returns all tab trigger elements inside the tabs container of the given trigger.
 * @param {HTMLButtonElement} trigger - The currently focused tab trigger.
 * @returns {Array<HTMLButtonElement>} The tab trigger elements in DOM order.
 */
function getTabTriggers(trigger: HTMLButtonElement): Array<HTMLButtonElement> {
	const tabsContainer = trigger.closest<HTMLDivElement>('[data-slot="tabs"]');
	if (!tabsContainer) return [];

	return Array.from(tabsContainer.querySelectorAll<HTMLButtonElement>('[data-slot="tab-trigger"]'));
}

/**
 * @description Handles keyboard navigation. ArrowLeft/ArrowRight moves focus between tabs; Home/End jump to the first/last tab.
 * @param {ReactKeyboardEvent<HTMLButtonElement>} event - The keyboard event.
 * @returns {void}
 */
export function tabsOnKeyDownHelper(event: ReactKeyboardEvent<HTMLButtonElement>): void {
	/** Map the horizontal navigation keys to a direction for the shared focus helper. */
	const directionByKey: Record<string, KeyboardNavigationDirectionType> = {
		ArrowLeft: 'previous',
		ArrowRight: 'next',
		Home: 'first',
		End: 'last',
	};
	const direction = directionByKey[event.key];
	if (!direction) return;

	event.preventDefault();

	moveFocusByDirection({
		elements: getTabTriggers(event.currentTarget),
		currentElement: event.currentTarget,
		direction,
	});
}
