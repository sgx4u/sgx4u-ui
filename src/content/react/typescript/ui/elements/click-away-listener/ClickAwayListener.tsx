'use client';

import { cloneElement, isValidElement, JSX, useEffect, useId } from 'react';

import { ClickAwayListenerPropsType } from './click-away-listener.type';

/**
 * @name Click Away Listener
 * @description Click away listener that uses a unique data-click-away-id for outside click detection.
 * @returns {JSX.Element} The ClickAwayListener component.
 */
export function ClickAwayListener({ active, onClickAway, children }: ClickAwayListenerPropsType): JSX.Element {
	if (!isValidElement(children)) {
		throw new Error('ClickAwayListener expects a single valid React element as its child.');
	}

	/** Unique id for the click away listener container. */
	const clickAwayId = useId();

	/** Handle click outside. */
	useEffect(() => {
		if (!active) return;

		const handleClickOutside = (event: MouseEvent | TouchEvent): void => {
			const target = event.target as HTMLElement;
			const inside = target.closest(`[data-click-away-id="${clickAwayId}"]`);
			if (!inside && active) onClickAway?.();
		};

		document.addEventListener('pointerdown', handleClickOutside);
		return (): void => {
			document.removeEventListener('pointerdown', handleClickOutside);
		};
	}, [onClickAway, clickAwayId, active]);

	/** If the click away listener is not active, return the children. */
	if (!active) return children;

	return cloneElement(children, { 'data-click-away-id': clickAwayId } as Record<string, unknown>);
}
