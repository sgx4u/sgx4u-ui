import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

import { SheetContentContextValueType, SheetContextValueType } from './sheet.type';
import { OverlayRecordType } from '../../helpers/animated-overlay-store.helper';

const DEFAULT_SHEET_RECORD: OverlayRecordType = { isMounted: false, phase: 'closed' };

/** Context for the Sheet component. */
export const SheetContext = createContext<SheetContextValueType | null>(null);

/** Context shared from SheetContent to its Title and Description for accessible name wiring. */
export const SheetContentContext = createContext<SheetContentContextValueType | null>(null);

/**
 * @description Accessor for sheet context. Throws if used outside a <Sheet> tree.
 * @returns {SheetContextValueType} The sheet context value.
 */
export function useSheetContext(): SheetContextValueType {
	const context = useContext(SheetContext);
	if (!context) {
		throw new Error('Sheet is missing. Wrap your component with <Sheet>.');
	}
	return context;
}

/**
 * @description Subscribes to the sheet state for a specific id via useSyncExternalStore.
 * @param {string} sheetId - The id of the sheet.
 * @returns {OverlayRecordType} The current sheet record.
 */
export function useSheetRecord(sheetId: string): OverlayRecordType {
	const { store } = useSheetContext();

	return useSyncExternalStore(
		store.subscribe,
		() => store.getSnapshot()[sheetId] ?? DEFAULT_SHEET_RECORD,
		() => DEFAULT_SHEET_RECORD,
	);
}

/**
 * @description Syncs a controlled open value into the store to preserve animations.
 * @param {object} props - The properties object.
 * @param {string} props.sheetId - The id of the sheet.
 * @param {boolean | undefined} props.isOpen - The controlled open state.
 * @param {(id: string) => void} props.open - Store open function.
 * @param {(id: string) => void} props.close - Store close function.
 * @returns {void}
 */
export function useControlledSync({
	sheetId,
	isOpen,
	open,
	close,
}: {
	sheetId: string;
	isOpen: boolean | undefined;
	open: (sheetId: string) => void;
	close: (sheetId: string) => void;
}): void {
	useEffect(() => {
		if (isOpen === undefined) return;
		if (isOpen) {
			open(sheetId);
			return;
		}
		close(sheetId);
	}, [sheetId, isOpen, open, close]);
}

/**
 * @description Destroys the store record for the given sheet id on unmount, preventing unbounded memory growth.
 * @param {string} sheetId - The id of the sheet to clean up.
 * @returns {void}
 */
export function useSheetRecordCleanup(sheetId: string): void {
	const { store } = useSheetContext();

	useEffect(() => {
		return (): void => {
			store.destroy(sheetId);
		};
	}, [sheetId, store]);
}
