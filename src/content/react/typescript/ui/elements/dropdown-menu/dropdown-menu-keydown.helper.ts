import { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';

import { moveFocusByDirection } from '../../utils/keyboard.util';

/**
 * @description Handles arrow key navigation between dropdown menu items. ArrowUp/ArrowDown navigates between menu items, skipping separators, labels, and disabled items.
 * @param {ReactKeyboardEvent<HTMLButtonElement>} event - The keyboard event.
 * @returns {void}
 */
export function dropdownMenuItemOnKeyDownHelper(event: ReactKeyboardEvent<HTMLButtonElement>): void {
	const key = event.key;
	if (key !== 'ArrowUp' && key !== 'ArrowDown') return;

	event.preventDefault();

	/** Find the menu container by traversing up from the current item. */
	const menuContainer = event.currentTarget.closest<HTMLDivElement>(
		'[data-slot="dropdown-menu-content"], [data-slot="dropdown-menu-sub-content"]',
	);
	if (!menuContainer) return;

	/** Get all menu items (items and sub-triggers) within the menu container. */
	const menuItems = Array.from(
		menuContainer.querySelectorAll<HTMLButtonElement>(
			'[data-slot="dropdown-menu-item"], [data-slot="dropdown-menu-sub-trigger"]',
		),
	);

	moveFocusByDirection({
		elements: menuItems,
		currentElement: event.currentTarget,
		direction: key === 'ArrowUp' ? 'previous' : 'next',
	});
}

/**
 * @description Handles ArrowLeft when focus is on a menu item inside sub-content: closes the sub-menu and returns focus to the sub-trigger. Call from DropdownMenuItem when inside a sub-menu.
 * @param {object} props - The props object.
 * @param {ReactKeyboardEvent<HTMLButtonElement>} props.event - The keyboard event.
 * @param {(open: boolean) => void} props.onOpenChange - The function to close the sub-menu.
 * @param {RefObject<HTMLButtonElement | null> | undefined} props.subTriggerRef - Ref to the sub-trigger button to receive focus.
 * @returns {boolean} True if the key was handled and the caller should skip further handling.
 */
export function dropdownMenuSubContentItemOnKeyDownHelper({
	event,
	onOpenChange,
	subTriggerRef,
}: {
	event: ReactKeyboardEvent<HTMLButtonElement>;
	onOpenChange: (open: boolean) => void;
	subTriggerRef: RefObject<HTMLButtonElement | null> | undefined;
}): boolean {
	if (event.key !== 'ArrowLeft') return false;

	const isInsideSubContent = event.currentTarget.closest('[data-slot="dropdown-menu-sub-content"]');
	if (!isInsideSubContent || !subTriggerRef?.current) return false;

	event.preventDefault();
	onOpenChange(false);
	subTriggerRef.current.focus();
	return true;
}

/**
 * @description Handles keyboard navigation for dropdown sub-menu triggers. ArrowRight opens sub-menu, ArrowLeft closes sub-menu, Escape closes sub-menu and parent menu.
 * @param {object} props - The props object.
 * @param {ReactKeyboardEvent<HTMLButtonElement>} props.event - The keyboard event.
 * @param {(open: boolean) => void} props.onOpenChange - The function to open or close the sub-menu.
 * @param {(open: boolean) => void} props.parentOnOpenChange - The function to close the parent menu.
 * @param {boolean} props.open - Whether the sub-menu is open.
 * @returns {void}
 */
export function dropdownMenuSubTriggerOnKeyDownHelper({
	event,
	onOpenChange,
	parentOnOpenChange,
	open,
}: {
	event: ReactKeyboardEvent<HTMLButtonElement>;
	onOpenChange: (open: boolean) => void;
	parentOnOpenChange: (open: boolean) => void;
	open: boolean;
}): void {
	if (event.key === 'ArrowRight') {
		/** Menu-specific: ArrowRight opens sub-menu. */
		event.preventDefault();
		if (!open) onOpenChange(true);
	} else if (event.key === 'ArrowLeft') {
		/** Menu-specific: ArrowLeft closes sub-menu. */
		event.preventDefault();
		if (open) onOpenChange(false);
	} else if (event.key === 'Escape') {
		/** Menu-specific: Escape closes sub-menu and parent menu. */
		event.preventDefault();
		onOpenChange(false);
		parentOnOpenChange(false);
	}
}
