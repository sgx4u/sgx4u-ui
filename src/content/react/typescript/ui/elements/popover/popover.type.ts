import { ReactNode } from 'react';

import {
	AnimatedOverlayStoreType,
	OverlayRecordType,
	OverlayStateType,
} from '../../helpers/animated-overlay-store.helper';

import { ButtonPropsType } from '../button';
import { ContainerPropsType } from '../container';
import { TextPropsType } from '../text';

/** Side of the trigger to align the popover against. */
export type PopoverAlignType = 'start' | 'center' | 'end';

/** Preferred side of the trigger to render the popover against. */
export type PopoverSideType = 'top' | 'right' | 'bottom' | 'left';

/** Props for Popover. */
export type PopoverPropsType = {
	/** Controlled open state. If provided, the popover becomes controlled and will call onOpenChange when open state changes. */
	open?: boolean;

	/** Controlled state change callback. Used when open is provided. */
	onOpenChange?: (nextOpen: boolean) => void;

	/** Side of the trigger to align against. Default - 'center'. */
	align?: PopoverAlignType;

	/** Distance in pixels from the trigger (alignment axis). Default - 0. */
	alignOffset?: number;

	/** Preferred side of the trigger to render against. Default - 'bottom'. */
	side?: PopoverSideType;

	/** Distance in pixels from the trigger (side axis). Default - 6. */
	sideOffset?: number;

	/** Distance in pixels from the window edge. Default - 6. */
	windowEdgeOffset?: number;

	/** Whether pressing Escape should close the popover. Default - true. */
	closeOnEscape?: boolean;

	/** Whether clicking outside the popover should close it. Default - true. */
	closeOnClickOutside?: boolean;

	/** Animation duration in milliseconds. Default - 150. */
	duration?: number;

	/** Whether to trap focus within the popover content. Default - true. */
	trapFocus?: boolean;

	/** Children to render. */
	children?: ReactNode;
};

/** Internal state for a single popover id. */
export type PopoverRecordType = OverlayRecordType;

/** Store state keyed by popover id. */
export type PopoverStateType = OverlayStateType;

/** External store for per-id popover subscriptions. */
export type PopoverStoreType = AnimatedOverlayStoreType;

/** Context value shared across all Popover sub-components. */
export type PopoverContextValueType = {
	/** Default popover id when Trigger/Content/Close do not provide popoverId. Generated at root. */
	defaultPopoverId: string;

	/** Popover store. */
	store: PopoverStoreType;

	/** Set the animation duration for a popover id. */
	setAnimationDuration: ({
		popoverId,
		duration,
		action,
	}: {
		popoverId: string;
		duration?: number;
		action: 'register' | 'unregister';
	}) => void;

	/** Retrieve the current trigger element for a popover id synchronously. */
	getTriggerElement: (popoverId: string) => HTMLElement | null;

	/** Register or unregister a trigger element for a popover id. Pass null to unregister. */
	registerTriggerRef: (popoverId: string, element: HTMLElement | null) => void;

	/** Increments every time a trigger mounts or unmounts, used as a dep to re-run position logic. */
	triggerRegistrationCount: number;

	/** Controlled open state. */
	open?: boolean;

	/** Controlled state change callback. */
	onOpenChange?: (nextOpen: boolean) => void;

	/** Whether pressing Escape should close the popover. */
	closeOnEscape?: boolean;

	/** Whether clicking outside the popover should close it. */
	closeOnClickOutside?: boolean;

	/** Whether to trap focus within the popover content. Default - true. */
	trapFocus?: boolean;

	/** Side of the trigger to align against. */
	align: PopoverAlignType;

	/** Distance in pixels from the trigger (alignment axis). */
	alignOffset: number;

	/** Preferred side of the trigger to render against. */
	side: PopoverSideType;

	/** Distance in pixels from the trigger (side axis). */
	sideOffset: number;

	/** Distance in pixels from the window edge. */
	windowEdgeOffset: number;

	/** Animation duration in milliseconds. */
	duration?: number;
};

/** Props for PopoverTrigger. */
export type PopoverTriggerPropsType = ButtonPropsType & {
	/** Optional id that links this trigger to a PopoverContent with the same id. If omitted, uses the root-generated default id. */
	popoverId?: string;

	/** Button action. Default - 'toggle'. */
	action?: 'open' | 'toggle';
};

/** Props for PopoverContent. */
export type PopoverContentPropsType = ContainerPropsType & {
	/** Optional id that links this content to a PopoverTrigger with the same id. If omitted, uses the root-generated default id. */
	popoverId?: string;
};

/** Props for PopoverClose. */
export type PopoverClosePropsType = ButtonPropsType & {
	/** Optional id that links this close button to a PopoverContent with the same id. If omitted, uses the root-generated default id. */
	popoverId?: string;
};

/** Props type for the PopoverTitle component. */
export type PopoverTitlePropsType = TextPropsType;

/** Props type for the PopoverDescription component. */
export type PopoverDescriptionPropsType = TextPropsType;
