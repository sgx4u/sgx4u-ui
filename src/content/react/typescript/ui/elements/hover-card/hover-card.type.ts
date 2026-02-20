import { ReactNode } from 'react';

import { ButtonPropsType } from '../button';
import { PopoverContentPropsType, PopoverPropsType } from '../popover';

/** HoverCard context value type. */
export type HoverCardContextValueType = {
	/** Start the open timer. */
	startOpenTimer: () => void;

	/** Start the close timer. */
	startCloseTimer: () => void;

	/** Clear the open timer. */
	clearOpenTimer: () => void;

	/** Clear the close timer. */
	clearCloseTimer: () => void;
};

/** HoverCard props type. */
export type HoverCardPropsType = Omit<PopoverPropsType, 'open' | 'onOpenChange'> & {
	/** Whether the hover card is open. */
	open?: boolean;

	/** Callback when the open state changes. */
	onOpenChange?: (open: boolean) => void;

	/** Delay in milliseconds before opening. Default - 500. */
	openDelay?: number;

	/** Delay in milliseconds before closing. Default - 300. */
	closeDelay?: number;

	/** Whether to close when the Escape key is pressed. Default - true. */
	closeOnEscape?: boolean;

	/** Animation duration in milliseconds. Default - 150. */
	duration?: number;

	/** Hover card children. */
	children?: ReactNode;
};

/** HoverCard trigger props type. */
export type HoverCardTriggerPropsType = ButtonPropsType;

/** HoverCard content props type. */
export type HoverCardContentPropsType = PopoverContentPropsType;
