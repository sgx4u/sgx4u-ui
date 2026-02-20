'use client';

import {
	createContext,
	JSX,
	MouseEvent as ReactMouseEvent,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

import {
	HoverCardContentPropsType,
	HoverCardContextValueType,
	HoverCardPropsType,
	HoverCardTriggerPropsType,
} from './hover-card.type';
import { cn } from '../../utils/styles.util';

import { Popover, PopoverContent, PopoverTrigger } from '../popover';

/** HoverCard context. */
const HoverCardContext = createContext<HoverCardContextValueType>({
	startOpenTimer: () => {},
	startCloseTimer: () => {},
	clearOpenTimer: () => {},
	clearCloseTimer: () => {},
});

/**
 * @name Hover Card
 * @description A small floating panel that reveals supplemental content when users hover or focus a trigger element.
 * @returns {JSX.Element} The HoverCard component.
 */
export function HoverCard({
	open,
	onOpenChange,
	openDelay = 500,
	closeDelay = 300,
	closeOnEscape = true,

	duration,

	children,

	...props
}: HoverCardPropsType): JSX.Element {
	/** Internal open state when open is not provided. */
	const [internalOpen, setInternalOpen] = useState(false);

	/** Controlled + Uncontrolled sync. */
	const currentOpen = open ?? internalOpen;

	/** Timer references. */
	const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearOpenTimer = useCallback((): void => {
		if (!openTimerRef.current) return;
		clearTimeout(openTimerRef.current);
		openTimerRef.current = null;
	}, []);

	const clearCloseTimer = useCallback((): void => {
		if (!closeTimerRef.current) return;
		clearTimeout(closeTimerRef.current);
		closeTimerRef.current = null;
	}, []);

	/** Always clear pending timers before applying a new open/close state. */
	const handleOpenChange = useCallback(
		(newOpen: boolean): void => {
			clearOpenTimer();
			clearCloseTimer();
			onOpenChange?.(newOpen);
			if (open === undefined) setInternalOpen(newOpen);
		},
		[open, onOpenChange, clearOpenTimer, clearCloseTimer],
	);

	const startOpenTimer = useCallback((): void => {
		clearOpenTimer();
		openTimerRef.current = setTimeout(() => {
			handleOpenChange(true);
		}, openDelay);
	}, [openDelay, clearOpenTimer, handleOpenChange]);

	const startCloseTimer = useCallback((): void => {
		clearCloseTimer();
		closeTimerRef.current = setTimeout(() => {
			handleOpenChange(false);
		}, closeDelay);
	}, [closeDelay, clearCloseTimer, handleOpenChange]);

	/** Cleanup timers on unmount. */
	useEffect(() => {
		return (): void => {
			clearOpenTimer();
			clearCloseTimer();
		};
	}, [clearOpenTimer, clearCloseTimer]);

	return (
		<HoverCardContext.Provider value={{ startOpenTimer, startCloseTimer, clearOpenTimer, clearCloseTimer }}>
			<Popover
				open={currentOpen}
				onOpenChange={handleOpenChange}
				closeOnClickOutside={false}
				closeOnEscape={closeOnEscape}
				sideOffset={4}
				duration={duration}
				{...props}
			>
				{children}
			</Popover>
		</HoverCardContext.Provider>
	);
}

/**
 * @name Hover Card Trigger
 * @description Wrapper around a trigger that coordinates open/close timers on mouse enter/leave.
 * @returns {JSX.Element} The HoverCardTrigger component.
 */
export function HoverCardTrigger({
	onMouseEnter,
	onMouseLeave,

	className,

	...props
}: HoverCardTriggerPropsType): JSX.Element {
	const { startOpenTimer, startCloseTimer, clearOpenTimer, clearCloseTimer } = useContext(HoverCardContext);

	const handleMouseEnter = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		onMouseEnter?.(event);
		clearCloseTimer();
		startOpenTimer();
	};

	const handleMouseLeave = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		onMouseLeave?.(event);
		clearOpenTimer();
		startCloseTimer();
	};

	return (
		<PopoverTrigger
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			variant="wrapper"
			size="wrapper"
			className={cn('rounded-md', className)}
			data-slot="hover-card-trigger"
			aria-haspopup="dialog"
			{...props}
		/>
	);
}

/**
 * @name Hover Card Content
 * @description Positioned hover card body that keeps the panel open while hovered and closes gracefully when focus leaves.
 * @returns {JSX.Element} The HoverCardContent component.
 */
export function HoverCardContent({
	onMouseEnter,
	onMouseLeave,

	className,

	...props
}: HoverCardContentPropsType): JSX.Element {
	const { startCloseTimer, clearCloseTimer } = useContext(HoverCardContext);

	return (
		<PopoverContent
			onMouseEnter={(event): void => {
				onMouseEnter?.(event);
				clearCloseTimer();
			}}
			onMouseLeave={(event): void => {
				onMouseLeave?.(event);
				startCloseTimer();
			}}
			className={cn('w-64', className)}
			data-slot="hover-card-content"
			aria-live="polite"
			{...props}
		/>
	);
}
