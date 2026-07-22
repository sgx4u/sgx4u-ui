'use client';

import { cloneElement, isValidElement, JSX, useEffect, useId } from 'react';

import { ClickAwayListenerPropsType } from './click-away-listener.type';

/**
 * @description Detects interactions outside a single child element (outside pointer down or the Escape key) and invokes a callback, using a unique data attribute for detection so no ref forwarding is required.
 * @returns {JSX.Element} The ClickAwayListener component.
 */
export function ClickAwayListener({
	active,
	closeOnEscape = true,
	onClickAway,
	children,
}: ClickAwayListenerPropsType): JSX.Element {
	/** Unique id used to detect whether an interaction happened inside the child. */
	const clickAwayId = useId();

	/** Dismiss on an outside pointer down or the Escape key while active. */
	useEffect(() => {
		if (!active) return;

		const handlePointerDown = (event: PointerEvent): void => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			if (!target.closest(`[data-click-away-id="${clickAwayId}"]`)) onClickAway?.();
		};

		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') onClickAway?.();
		};

		document.addEventListener('pointerdown', handlePointerDown);
		if (closeOnEscape) document.addEventListener('keydown', handleKeyDown);

		return (): void => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [active, closeOnEscape, onClickAway, clickAwayId]);

	if (!isValidElement(children)) {
		throw new Error('ClickAwayListener expects a single valid React element as its child.');
	}

	if (!active) return children;

	return cloneElement(children, { 'data-click-away-id': clickAwayId } as Record<string, unknown>);
}
