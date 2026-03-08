'use client';

import { JSX, useEffect, useRef } from 'react';

import { FocusTrapPropsType } from './focus-trap.type';

import { Container } from '../container';

/**
 * @description Focus management utility that traps keyboard focus within its children, restores the previously focused element on cleanup, and guards against focus escaping via mouse or script.
 * @returns {JSX.Element} The FocusTrap component.
 */
export function FocusTrap({
	active = true,
	returnFocusOnDeactivate = true,
	children,
}: FocusTrapPropsType): JSX.Element {
	/** Direct ref to the wrapper container — avoids any document.querySelector call. */
	const containerRef = useRef<HTMLDivElement | null>(null);

	/** Previously focused element, stored so it can be restored on deactivation. */
	const previouslyFocusedRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!active) return;

		const container = containerRef.current;
		if (!container) return;

		/** Store the element that had focus before focus trap activates. */
		if (previouslyFocusedRef.current === null) {
			previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
		}

		/** Move initial focus to the first focusable element or the container itself. */
		const focusableElements = getFocusableElements(container);
		if (focusableElements.length > 0) focusableElements[0].focus();
		else container.focus();

		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key !== 'Tab') return;

			const elements = getFocusableElements(container);
			const activeElement = document.activeElement;

			/** No focusable children — keep focus on the container. */
			if (elements.length === 0) {
				event.preventDefault();
				if (activeElement !== container) container.focus();
				return;
			}

			const first = elements[0];
			const last = elements[elements.length - 1];

			if (event.shiftKey) {
				if (activeElement === first || activeElement === container) {
					event.preventDefault();
					last.focus();
				}
			} else {
				if (activeElement === last || activeElement === container) {
					event.preventDefault();
					first.focus();
				}
			}
		};

		const handleFocusIn = (event: FocusEvent): void => {
			if (container.contains(event.target as Node)) return;

			const elements = getFocusableElements(container);
			if (elements.length > 0) elements[0].focus();
			else container.focus();
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('focusin', handleFocusIn);

		return (): void => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('focusin', handleFocusIn);

			if (returnFocusOnDeactivate && previouslyFocusedRef.current) {
				previouslyFocusedRef.current.focus();
				previouslyFocusedRef.current = null;
			}
		};
	}, [active, returnFocusOnDeactivate]);

	return (
		<Container as="div" ref={containerRef} data-slot="focus-trap" tabIndex={-1}>
			{children}
		</Container>
	);
}

/**
 * @description Returns all tabbable/focusable elements inside a container that are visible and not disabled.
 * @param {HTMLElement} container - The container to search within.
 * @returns {Array<HTMLElement>} The focusable elements in DOM order.
 */
function getFocusableElements(container: HTMLElement): Array<HTMLElement> {
	const selectors = [
		'a[href]:not([tabindex="-1"])',
		'area[href]',
		'input:not([disabled]):not([type="hidden"])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'button:not([disabled])',
		'iframe',
		'object',
		'embed',
		'[contenteditable]:not([contenteditable="false"])',
		'[tabindex]:not([tabindex="-1"])',
	];

	const nodes = Array.from(container.querySelectorAll<HTMLElement>(selectors.join(',')));
	return nodes.filter(
		(element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden') && isVisible(element),
	);
}

/**
 * @description Returns true if the element has non-zero dimensions and is not hidden via CSS visibility.
 * @param {HTMLElement} element - The element to check.
 * @returns {boolean} Whether the element is visible.
 */
function isVisible(element: HTMLElement): boolean {
	const rect = element.getBoundingClientRect();
	return rect.width > 0 && rect.height > 0 && window.getComputedStyle(element).visibility !== 'hidden';
}
