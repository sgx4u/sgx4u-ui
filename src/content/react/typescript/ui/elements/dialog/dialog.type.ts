import { ReactNode } from 'react';

import { AnimatedOverlayStoreType } from '../../helpers/animated-overlay-store.helper';

import { BackdropPropsType } from '../backdrop';
import { ButtonPropsType } from '../button';
import { ContainerPropsType } from '../container';
import { TextPropsType } from '../text';

/** Props for Dialog. */
export type DialogPropsType = {
	/** Controlled open state. If provided, the dialog becomes controlled and will call onOpenChange when open state changes. */
	open?: boolean;

	/** Controlled state change callback. Used when open is provided. */
	onOpenChange?: (nextOpen: boolean) => void;

	/** Optional portal destination for this dialog instance. If omitted, uses Dialog defaultContainer, which defaults to document.body. */
	container?: HTMLElement | undefined;

	/** Clicking the backdrop closes the dialog. Default - true. */
	closeOnBackdropClick?: boolean;

	/** Whether pressing Escape should close the dialog. Default - true. */
	closeOnEscape?: boolean;

	/** Whether to hide the close button. Default - false. */
	hideCloseButton?: boolean;

	/** Animation duration in milliseconds. Default - 150. */
	duration?: number;

	/** Additional props applied to the "backdrop" which is a "Backdrop" element. */
	backdropProps?: BackdropPropsType;

	/** Children to render. */
	children?: ReactNode;
};

/** External store for per-id dialog subscriptions. */
export type DialogStoreType = AnimatedOverlayStoreType;

/** Context value is stable: store + configRef. */
export type DialogContextValueType = {
	/** Default dialog id when Trigger/Content/Close do not provide dialogId. Generated at root. */
	defaultDialogId: string;

	/** Dialog store. */
	store: DialogStoreType;

	/** Set the animation duration for a dialog id. */
	setAnimationDuration: ({
		dialogId,
		duration,
		action,
	}: {
		dialogId: string;
		duration?: number;
		action: 'register' | 'unregister';
	}) => void;

	/** Controlled open state. If provided, the dialog becomes controlled and will call onOpenChange when open state changes. */
	open?: boolean;

	/** Controlled state change callback. Used when open is provided. */
	onOpenChange?: (nextOpen: boolean) => void;

	/** Optional portal destination for this dialog instance. If omitted, uses Dialog defaultContainer, which defaults to document.body. */
	container?: HTMLElement | undefined;

	/** Clicking the backdrop closes the dialog. Default - true. */
	closeOnBackdropClick?: boolean;

	/** Whether pressing Escape should close the dialog. Default - true. */
	closeOnEscape?: boolean;

	/** Whether to hide the close button. Default - false. */
	hideCloseButton?: boolean;

	/** Animation duration in milliseconds. Default - 150. */
	duration?: number;

	/** Additional props applied to the "backdrop" which is a "Backdrop" element. */
	backdropProps?: BackdropPropsType;
};

/** Context value shared from DialogContent to its Title and Description for accessible name wiring. */
export type DialogContentContextValueType = {
	/** Id applied to the DialogTitle and referenced by the dialog's aria-labelledby. */
	titleId: string;

	/** Id applied to the DialogDescription and referenced by the dialog's aria-describedby. */
	descriptionId: string;

	/** Registers whether a DialogTitle is present so the dialog only labels itself when one exists. */
	registerTitle: (present: boolean) => void;

	/** Registers whether a DialogDescription is present so the dialog only describes itself when one exists. */
	registerDescription: (present: boolean) => void;
};

/** Props for DialogTrigger. */
export type DialogTriggerPropsType = ButtonPropsType & {
	/** Optional id that links this trigger to a DialogContent with the same id. If omitted, uses the root-generated default id. */
	dialogId?: string;

	/** Button action. Default - open. */
	action?: 'open' | 'toggle';
};

/** Props for DialogContent. */
export type DialogContentPropsType = ContainerPropsType & {
	/** Optional id that links this content to a DialogTrigger with the same id. If omitted, uses the root-generated default id. */
	dialogId?: string;
};

/** Props for DialogClose. */
export type DialogClosePropsType = ButtonPropsType & {
	/** Optional id that links this close button to a DialogContent with the same id. If omitted, uses the root-generated default id. */
	dialogId?: string;
};

/** Props type for the DialogTitle component. */
export type DialogTitlePropsType = Omit<TextPropsType, 'as'> & {
	/** HTML element to render as. Default - title. */
	as?: TextPropsType['as'];
};

/** Props type for the DialogDescription component. */
export type DialogDescriptionPropsType = Omit<TextPropsType, 'as'> & {
	/** HTML element to render as. Default - subtitle. */
	as?: TextPropsType['as'];
};
