'use client';

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

import { PopoverContextValueType } from './popover.type';
import { OverlayRecordType } from '../../helpers/animated-overlay-store.helper';

const DEFAULT_POPOVER_RECORD: OverlayRecordType = { isMounted: false, phase: 'closed' };

/** Context for the Popover component. */
export const PopoverContext = createContext<PopoverContextValueType | null>(null);

/**
 * @description Accessor for popover context. Throws if used outside a <Popover> tree.
 * @returns {PopoverContextValueType} The popover context value.
 */
export function usePopoverContext(): PopoverContextValueType {
	const context = useContext(PopoverContext);
	if (!context) {
		throw new Error('Popover is missing. Wrap your component with <Popover>.');
	}
	return context;
}

/**
 * @description Subscribes to the popover state for a specific id via useSyncExternalStore.
 * @param {string} popoverId - The id of the popover.
 * @returns {OverlayRecordType} The current popover record.
 */
export function usePopoverRecord(popoverId: string): OverlayRecordType {
	const { store } = usePopoverContext();

	return useSyncExternalStore(
		store.subscribe,
		() => store.getSnapshot()[popoverId] ?? DEFAULT_POPOVER_RECORD,
		() => DEFAULT_POPOVER_RECORD,
	);
}

/**
 * @description Syncs a controlled open value into the store to preserve animations.
 * @param {object} props - The props object.
 * @param {string} props.popoverId - The id of the popover.
 * @param {boolean | undefined} props.isOpen - The controlled open state.
 * @param {(id: string) => void} props.open - Store open function.
 * @param {(id: string) => void} props.close - Store close function.
 * @returns {void}
 */
export function useControlledSync({
	popoverId,
	isOpen,
	open,
	close,
}: {
	popoverId: string;
	isOpen: boolean | undefined;
	open: (popoverId: string) => void;
	close: (popoverId: string) => void;
}): void {
	useEffect(() => {
		if (isOpen === undefined) return;
		if (isOpen) {
			open(popoverId);
			return;
		}
		close(popoverId);
	}, [popoverId, isOpen, open, close]);
}

/**
 * @description Destroys the store record for the given popover id on unmount, preventing unbounded memory growth.
 * @param {string} popoverId - The id of the popover to clean up.
 * @returns {void}
 */
export function usePopoverRecordCleanup(popoverId: string): void {
	const { store } = usePopoverContext();

	useEffect(() => {
		return (): void => {
			store.destroy(popoverId);
		};
	}, [popoverId, store]);
}
