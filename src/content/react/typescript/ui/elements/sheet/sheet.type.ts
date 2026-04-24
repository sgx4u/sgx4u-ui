import { ReactNode } from 'react';

import { AnimatedOverlayStoreType } from '../../helpers/animated-overlay-store.helper';

import { BackdropPropsType } from '../backdrop';
import { ButtonPropsType } from '../button';
import { ContainerPropsType } from '../container';
import { TextPropsType } from '../text';

/** External store for per-id sheet subscriptions. */
export type SheetStoreType = AnimatedOverlayStoreType;

/** Context value shared with all Sheet sub-components. */
export type SheetContextValueType = {
	/** Default sheet id generated at the root, used when Trigger/Content/Close do not provide sheetId. */
	defaultSheetId: string;

	/** Sheet store. */
	store: SheetStoreType;

	/** Register or unregister the animation duration for a sheet id. */
	setAnimationDuration: ({
		sheetId,
		duration,
		action,
	}: {
		sheetId: string;
		duration?: number;
		action: 'register' | 'unregister';
	}) => void;

	/** Controlled open state. If provided, the sheet becomes controlled. */
	open?: boolean;

	/** Controlled state change callback. */
	onOpenChange?: (nextOpen: boolean) => void;

	/** Whether the sheet is dismissible via backdrop click. */
	closeOnBackdropClick: boolean;

	/** Animation speed in milliseconds. */
	animationSpeed: number;

	/** Additional props applied to the backdrop. */
	backdropProps?: Omit<BackdropPropsType, 'visible' | 'onVisibilityChange' | 'closeOnClick'>;
};

/** Sheet props type. */
export type SheetPropsType = {
	/** Whether sheet is open. */
	open?: boolean;

	/** On open change callback. */
	onOpenChange?: (open: boolean) => void;

	/** Whether sheet is dismissible via backdrop click. Default - true. */
	closeOnBackdropClick?: boolean;

	/** Animation speed in milliseconds. Default - 400. */
	animationSpeed?: number;

	/** Backdrop props. */
	backdropProps?: Omit<BackdropPropsType, 'visible' | 'onVisibilityChange' | 'closeOnClick'>;

	/** Sheet children. */
	children?: ReactNode;
};

/** Sheet trigger props type. */
export type SheetTriggerPropsType = ButtonPropsType & {
	/** Optional id linking this trigger to a SheetContent with the same id. If omitted, uses the root-generated default id. */
	sheetId?: string;
};

/** Sheet content props type. */
export type SheetContentPropsType = ContainerPropsType & {
	/** Side of the screen to slide from. Default - right. */
	side?: 'top' | 'right' | 'bottom' | 'left';

	/** Optional id linking this content to a SheetTrigger with the same id. If omitted, uses the root-generated default id. */
	sheetId?: string;
};

/** Sheet title props type. */
export type SheetTitlePropsType = TextPropsType;

/** Sheet description props type. */
export type SheetDescriptionPropsType = TextPropsType;

/** Sheet close props type. */
export type SheetClosePropsType = ButtonPropsType & {
	/** Optional id linking this close button to a SheetContent with the same id. If omitted, uses the root-generated default id. */
	sheetId?: string;
};
