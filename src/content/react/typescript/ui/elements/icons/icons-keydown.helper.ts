import { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { isActivationKey } from '../../utils/keyboard.util';

/**
 * @description Handles keyboard events for Enter and Spacebar keys to trigger toggle action.
 * @param {object} props - The props for the helper.
 * @param {ReactKeyboardEvent<SVGSVGElement>} props.event - The keyboard event.
 * @param {() => void} props.toggleVisibility - The function to toggle the visibility.
 * @returns {void}
 */
export function iconsOnKeyDownHelper({
	event,
	toggleVisibility,
}: {
	event: ReactKeyboardEvent<SVGSVGElement>;
	toggleVisibility: () => void;
}): void {
	if (!isActivationKey(event.key)) return;

	/** Prevent page scroll when activating with the space key. */
	if (event.key === ' ' || event.key === 'Spacebar') event.preventDefault();
	toggleVisibility();
}
