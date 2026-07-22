import { RefCallback, useEffect, useRef } from 'react';

import { parseShortcut, registerKeyboardShortcut, resolveActionableElement } from '../utils/keyboard-shortcut.util';

/** Props accepted by the useKeyboardShortcut hook. */
export type UseKeyboardShortcutPropsType = {
	/** The shortcut combo (e.g. "mod+k" or ["mod", "shift", "k"]). */
	keys: string | Array<string>;

	/** Called instead of the default click when the shortcut is triggered. */
	onTrigger?: (event: KeyboardEvent) => void;

	/** An explicit element (via ref) or CSS selector to trigger, instead of the nearest actionable ancestor of the registered element. */
	target?: { current: HTMLElement | null } | string;

	/** Skips registration entirely while true. */
	disabled?: boolean;

	/** Whether the shortcut should still fire while an input/textarea/select/contenteditable is focused. Default - false. */
	enableOnFormElements?: boolean;

	/** Whether to call event.preventDefault() when the shortcut is triggered. Default - true. */
	preventDefault?: boolean;
};

/** Return type of the useKeyboardShortcut hook. */
export type UseKeyboardShortcutReturnType = {
	/** Ref callback to attach to the DOM node the shortcut is nested inside. */
	ref: RefCallback<HTMLElement>;
};

/**
 * @description Registers a global keyboard shortcut that triggers the nearest actionable ancestor (button, link, or ARIA menu item) of the returned ref, or a custom target/onTrigger. Registration is scoped to the component's mounted lifetime, so shortcuts placed inside overlays (popovers, dropdown menus, dialogs) that unmount when closed are automatically inert while closed.
 * @returns {UseKeyboardShortcutReturnType} The ref callback to attach to the source element.
 */
export function useKeyboardShortcut({
	keys,
	onTrigger,
	target,
	disabled = false,
	enableOnFormElements = false,
	preventDefault = true,
}: UseKeyboardShortcutPropsType): UseKeyboardShortcutReturnType {
	const elementRef = useRef<HTMLElement | null>(null);

	/** Kept in refs so the registration effect does not need to re-run on every render when these change identity. */
	const onTriggerRef = useRef(onTrigger);
	const targetRef = useRef(target);

	useEffect(() => {
		onTriggerRef.current = onTrigger;
		targetRef.current = target;
	}, [onTrigger, target]);

	const setRef: RefCallback<HTMLElement> = (element): void => {
		elementRef.current = element;
	};

	useEffect(() => {
		if (disabled) return;

		const parsed = parseShortcut(keys);

		/**
		 * @description Resolves the element the shortcut should act on: an explicit target (ref or selector) if provided, otherwise the nearest actionable ancestor of the registered element.
		 * @returns {HTMLElement | null} The resolved target element, or null when none is found.
		 */
		const resolveTargetElement = (): HTMLElement | null => {
			const currentTarget = targetRef.current;
			if (typeof currentTarget === 'string') return document.querySelector<HTMLElement>(currentTarget);
			if (currentTarget) return currentTarget.current;
			return resolveActionableElement(elementRef.current);
		};

		const unregister = registerKeyboardShortcut({
			parsed,
			resolveTargetElement,
			enableOnFormElements,
			preventDefault,
			handleTrigger: (event, targetElement): void => {
				const currentOnTrigger = onTriggerRef.current;
				if (currentOnTrigger) currentOnTrigger(event);
				else targetElement.click();
			},
		});

		return unregister;
	}, [keys, disabled, enableOnFormElements, preventDefault]);

	return { ref: setRef };
}
