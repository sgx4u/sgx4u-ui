import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

import { DialogContextValueType } from './dialog.type';
import { OverlayRecordType } from '../../helpers/animated-overlay-store.helper';

const DEFAULT_DIALOG_RECORD: OverlayRecordType = { isMounted: false, phase: 'closed' };

/** Context for the Dialog component. */
export const DialogContext = createContext<DialogContextValueType | null>(null);

/**
 * @description Accessor for dialog context. Throws if used outside a <Dialog> tree.
 * @returns {DialogContextValueType} The dialog context value.
 */
export function useDialogContext(): DialogContextValueType {
	const context = useContext(DialogContext);
	if (!context) {
		throw new Error('Dialog is missing. Wrap your app with <Dialog>.');
	}
	return context;
}

/**
 * @description Subscribes to the dialog state for a specific id via useSyncExternalStore.
 * @param {string} dialogId - The id of the dialog.
 * @returns {OverlayRecordType} The current dialog record.
 */
export function useDialogRecord(dialogId: string): OverlayRecordType {
	const { store } = useDialogContext();

	return useSyncExternalStore(
		store.subscribe,
		() => store.getSnapshot()[dialogId] ?? DEFAULT_DIALOG_RECORD,
		() => DEFAULT_DIALOG_RECORD,
	);
}

/**
 * @description Syncs a controlled open value into the store to preserve animations.
 * @param {object} props - The props object.
 * @param {string} props.dialogId - The id of the dialog.
 * @param {boolean | undefined} props.isOpen - The controlled open state.
 * @param {(id: string) => void} props.open - Store open function.
 * @param {(id: string) => void} props.close - Store close function.
 * @returns {void}
 */
export function useControlledSync({
	dialogId,
	isOpen,
	open,
	close,
}: {
	dialogId: string;
	isOpen: boolean | undefined;
	open: (dialogId: string) => void;
	close: (dialogId: string) => void;
}): void {
	useEffect(() => {
		if (isOpen === undefined) return;
		if (isOpen) {
			open(dialogId);
			return;
		}
		close(dialogId);
	}, [dialogId, isOpen, open, close]);
}

/**
 * @description Destroys the store record for the given dialog id on unmount, preventing unbounded memory growth.
 * @param {string} dialogId - The id of the dialog to clean up.
 * @returns {void}
 */
export function useDialogRecordCleanup(dialogId: string): void {
	const { store } = useDialogContext();

	useEffect(() => {
		return (): void => {
			store.destroy(dialogId);
		};
	}, [dialogId, store]);
}
