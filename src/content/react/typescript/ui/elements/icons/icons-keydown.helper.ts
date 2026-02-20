import { KeyboardEvent as ReactKeyboardEvent } from 'react';

// eslint-disable-next-line no-secrets/no-secrets
/**
 * @description Handles keyboard events for Enter and Spacebar keys to trigger toggle action.
 * @param {object} props - The options for the helper.
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
	const isEnter = event.key === 'Enter';
	const isSpacebar = event.key === ' ' || event.key === 'Spacebar';

	if (isEnter || isSpacebar) {
		if (isSpacebar) event.preventDefault();
		toggleVisibility();
	}
}
