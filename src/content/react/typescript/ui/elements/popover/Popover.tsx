'use client';

import {
	JSX,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent as ReactMouseEvent,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { XIcon } from 'lucide-react';

import {
	PopoverClosePropsType,
	PopoverContentPropsType,
	PopoverDescriptionPropsType,
	PopoverPropsType,
	PopoverSideType,
	PopoverStoreType,
	PopoverTitlePropsType,
	PopoverTriggerPropsType,
} from './popover.type';
import { cn } from '../../utils/styles.util';
import { createAnimatedOverlayStore } from '../../helpers/animated-overlay-store.helper';
import { computePopoverPosition, getClosedTranslateClass } from './popover.helper';

import { useReducedMotion } from '../../hooks/useReducedMotion.hook';
import {
	PopoverContext,
	useControlledSync,
	usePopoverContext,
	usePopoverRecord,
	usePopoverRecordCleanup,
} from './usePopover.hook';

import { Button } from '../button';
import { Container } from '../container';
import { FocusTrap } from '../focus-trap';
import { Portal } from '../portal';
import { Text } from '../text';

/**
 * @description Root element for the Popover component.
 * @param {PopoverPropsType} props - The props for the Popover component.
 * @returns {JSX.Element} The Popover component.
 */
export function Popover({
	open,
	onOpenChange,
	closeOnEscape = true,
	closeOnClickOutside = true,
	ignoreOutsideClick,
	trapFocus = true,

	align = 'center',
	alignOffset = 0,
	side = 'bottom',
	sideOffset = 6,
	windowEdgeOffset = 6,
	duration = 150,

	children,
}: PopoverPropsType): JSX.Element {
	/* Store the animation duration for each popover id. */
	const [durationsBox] = useState<{ popoverId: Map<string, number>; duration: number }>(() => ({
		popoverId: new Map<string, number>(),
		duration: 150,
	}));

	/* Create the popover store. */
	const [store] = useState<PopoverStoreType>(() =>
		createAnimatedOverlayStore((popoverId) => durationsBox.popoverId.get(popoverId) ?? durationsBox.duration),
	);

	/* Default id when Trigger/Content/Close do not provide popoverId. */
	const defaultPopoverId = useId();

	/* Holds trigger elements keyed by popoverId. Mutated in-place so reads are always current. */
	const triggerElementsRef = useRef<Map<string, HTMLElement | null>>(new Map());

	/* Counter that increments each time a trigger mounts or unmounts, allowing dependents to re-run position logic. */
	const [triggerRegistrationCount, setTriggerRegistrationCount] = useState(0);

	/* Get the trigger element for a popover id. */
	const getTriggerElement = useCallback((popoverId: string): HTMLElement | null => {
		return triggerElementsRef.current.get(popoverId) ?? null;
	}, []);

	/* Register the trigger element for a popover id. */
	const registerTriggerRef = useCallback((popoverId: string, element: HTMLElement | null): void => {
		if (element === null) triggerElementsRef.current.delete(popoverId);
		else triggerElementsRef.current.set(popoverId, element);
		setTriggerRegistrationCount((count) => count + 1);
	}, []);

	/* Register the animation duration for a popover id. */
	const setAnimationDuration = ({
		popoverId,
		duration,
		action,
	}: {
		popoverId: string;
		duration?: number;
		action: 'register' | 'unregister';
	}): void => {
		if (action === 'unregister') durationsBox.popoverId.delete(popoverId);
		else durationsBox.popoverId.set(popoverId, duration ?? durationsBox.duration);
	};

	return (
		<PopoverContext.Provider
			value={{
				defaultPopoverId,
				store,
				setAnimationDuration,
				getTriggerElement,
				registerTriggerRef,
				triggerRegistrationCount,

				open,
				onOpenChange,
				closeOnEscape,
				closeOnClickOutside,
				ignoreOutsideClick,
				trapFocus,

				align,
				alignOffset,
				side,
				sideOffset,
				windowEdgeOffset,
				duration,
			}}
		>
			{children}
		</PopoverContext.Provider>
	);
}

/**
 * @description A trigger button that opens/toggles a popover by id.
 * @param {PopoverTriggerPropsType} props - The props for the PopoverTrigger component.
 * @returns {JSX.Element} The PopoverTrigger component.
 */
export function PopoverTrigger({
	popoverId: popoverIdProp,
	onClick,
	ref: refFromProps,
	action = 'toggle',

	...props
}: PopoverTriggerPropsType): JSX.Element {
	/* Get the popover context. */
	const { defaultPopoverId, store, open, onOpenChange, registerTriggerRef } = usePopoverContext();
	const effectivePopoverId = popoverIdProp ?? defaultPopoverId;

	/* Get the popover record. */
	const record = usePopoverRecord(effectivePopoverId);

	/* Controlled + Uncontrolled sync. */
	useControlledSync({
		popoverId: effectivePopoverId,
		isOpen: open,
		open: store.open,
		close: store.close,
	});

	/* Check if the popover is open. */
	const isOpen = open ?? (record.isMounted && (record.phase === 'open' || record.phase === 'opening'));

	/* Register the trigger DOM element so PopoverContent can anchor to it, and forward any ref from props. */
	const setTriggerRef = (element: HTMLButtonElement | null): void => {
		registerTriggerRef(effectivePopoverId, element);
		if (typeof refFromProps === 'function') refFromProps(element);
		else if (refFromProps) refFromProps.current = element;
	};

	/* Handle the mouse down event. */
	const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		if (open !== undefined) {
			onOpenChange?.(action === 'toggle' ? !isOpen : true);
			onClick?.(event);
			return;
		}

		if (action === 'toggle') store.toggle(effectivePopoverId);
		else store.open(effectivePopoverId);
		onClick?.(event);
	};

	return (
		<Button
			ref={setTriggerRef}
			onClick={handleClick}
			data-slot="PopoverTrigger"
			aria-haspopup="true"
			aria-expanded={isOpen}
			aria-controls={`popover-${effectivePopoverId}`}
			{...props}
		/>
	);
}

/**
 * @description Popover panel that renders in a portal, anchors to its trigger, and animates in/out.
 * @param {PopoverContentPropsType} props - The props for the PopoverContent component.
 * @returns {JSX.Element} The PopoverContent component.
 */
export function PopoverContent({
	popoverId: popoverIdProp,
	onKeyDown,

	style,
	className,

	children,

	...props
}: PopoverContentPropsType): JSX.Element {
	/* Get the popover context. */
	const {
		defaultPopoverId,
		store,
		setAnimationDuration,
		getTriggerElement,
		triggerRegistrationCount,

		open,
		onOpenChange,
		closeOnEscape,
		closeOnClickOutside,
		ignoreOutsideClick,
		trapFocus,

		align,
		alignOffset,
		side,
		sideOffset,
		windowEdgeOffset,
		duration,
	} = usePopoverContext();
	const effectivePopoverId = popoverIdProp ?? defaultPopoverId;

	/* Get the popover record. */
	const record = usePopoverRecord(effectivePopoverId);

	/* Controlled + Uncontrolled sync. */
	useControlledSync({
		popoverId: effectivePopoverId,
		isOpen: open,
		open: store.open,
		close: store.close,
	});

	/* State to store the position and effective side (after auto-flip) of the popover content. */
	const [position, setPosition] = useState<{ top: number; left: number; effectiveSide: PopoverSideType } | null>(
		null,
	);

	/* Ref to store the popover content element. */
	const popoverContentRef = useRef<HTMLDivElement | null>(null);

	/*
	 * Counter that increments when the content element actually mounts into the DOM.
	 * Portal defers its mount to a useEffect, so popoverContentRef.current is null on the
	 * first useLayoutEffect run. This counter causes the layout effect to re-run once the
	 * real DOM node is available.
	 */
	const [contentMountCount, setContentMountCount] = useState(0);

	const setContentRef = useCallback((node: HTMLDivElement | null): void => {
		popoverContentRef.current = node;
		if (node) setContentMountCount((count) => count + 1);
	}, []);

	/* Register the animation duration for the popover id. */
	useEffect(() => {
		setAnimationDuration({ popoverId: effectivePopoverId, duration, action: 'register' });
		return (): void => {
			setAnimationDuration({ popoverId: effectivePopoverId, action: 'unregister' });
		};
	}, [effectivePopoverId, duration, setAnimationDuration]);

	/* Destroy the store record when this content unmounts, freeing memory. */
	usePopoverRecordCleanup(effectivePopoverId);

	/* Check if the popover is open like. */
	const isOpenLike = record.isMounted && (record.phase === 'open' || record.phase === 'opening');
	/* Check if the popover should render. */
	const shouldRender = record.isMounted;

	/* Handle the close event. */
	const handleClose = useCallback((): void => {
		if (open === undefined) store.close(effectivePopoverId);
		else onOpenChange?.(false);
	}, [open, onOpenChange, store, effectivePopoverId]);

	/* Recalculate position from trigger's current bounding rect. getTriggerElement reads the ref synchronously so it is always current. */
	const updatePosition = useCallback((): void => {
		const triggerElement = getTriggerElement(effectivePopoverId);
		const contentElement = popoverContentRef.current;
		if (!triggerElement || !contentElement) return;

		const triggerRect = triggerElement.getBoundingClientRect();
		const contentRect = contentElement.getBoundingClientRect();
		setPosition(
			computePopoverPosition(triggerRect, contentRect, side, align, sideOffset, alignOffset, windowEdgeOffset),
		);
	}, [effectivePopoverId, getTriggerElement, side, align, sideOffset, alignOffset, windowEdgeOffset]);

	/* Compute position when: content mounts (contentMountCount), trigger registers (triggerRegistrationCount), or side/align/offsets change (updatePosition). */
	useLayoutEffect(() => {
		if (!shouldRender) return;
		updatePosition();
	}, [shouldRender, updatePosition, triggerRegistrationCount, contentMountCount]);

	/* Keep position in sync with scroll and window resize. */
	useEffect(() => {
		if (!shouldRender) return;

		window.addEventListener('scroll', updatePosition, true);
		window.addEventListener('resize', updatePosition);

		return (): void => {
			window.removeEventListener('scroll', updatePosition, true);
			window.removeEventListener('resize', updatePosition);
		};
	}, [shouldRender, updatePosition]);

	/* Close when a mousedown occurs outside both the content and the trigger. */
	useEffect(() => {
		if (!isOpenLike || !closeOnClickOutside) return;

		/* Handle the outside mouse down event. */
		const handleOutsideMouseDown = (event: MouseEvent): void => {
			const contentElement = popoverContentRef.current;
			const triggerElement = getTriggerElement(effectivePopoverId);

			if (contentElement?.contains(event.target as Node)) return;
			if (triggerElement?.contains(event.target as Node)) return;
			if (ignoreOutsideClick) return;

			handleClose();
		};

		document.addEventListener('mousedown', handleOutsideMouseDown);
		return (): void => {
			document.removeEventListener('mousedown', handleOutsideMouseDown);
		};
	}, [isOpenLike, closeOnClickOutside, ignoreOutsideClick, effectivePopoverId, getTriggerElement, handleClose]);

	/* Listen for Escape at document level so the popover closes regardless of where focus is (e.g. when trapFocus is false). */
	useEffect(() => {
		if (!shouldRender || !isOpenLike) return;

		const handleDocumentKeyDown = (event: KeyboardEvent): void => {
			if (event.key !== 'Escape' || !(closeOnEscape ?? true)) return;
			event.preventDefault();
			event.stopPropagation();
			handleClose();
		};

		document.addEventListener('keydown', handleDocumentKeyDown, true);
		return (): void => document.removeEventListener('keydown', handleDocumentKeyDown, true);
	}, [shouldRender, isOpenLike, closeOnEscape, handleClose]);

	/* Handle the key down event on the content (for consumer onKeyDown and as fallback when focus is inside). */
	const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
		onKeyDown?.(event);

		if (event.key === 'Escape' && closeOnEscape) {
			event.stopPropagation();
			handleClose();
		}
	};

	const prefersReducedMotion = useReducedMotion();

	if (!shouldRender) return <></>;

	const isVisible = record.phase === 'open';
	const transitionDuration = prefersReducedMotion ? 0 : duration;
	/** Use the effective side from the auto-flip calculation (falls back to the preferred side while position is not yet computed). */
	const activeSide = position?.effectiveSide ?? side;

	return (
		<Portal>
			{/* Outer wrapper: fixed positioning + translate animation only. Ref lives here so size can be measured. */}
			<FocusTrap active={isVisible && trapFocus}>
				<Container
					ref={setContentRef}
					style={{
						position: 'fixed',
						top: position?.top ?? -9999,
						left: position?.left ?? -9999,
						transitionDuration: `${transitionDuration}ms`,
					}}
					className={cn(
						'z-1001 overflow-visible transition-transform will-change-transform',
						isVisible ? 'translate-x-0 translate-y-0' : getClosedTranslateClass(activeSide),
					)}
					data-slot="PopoverMotion"
					aria-hidden={!isVisible}
				>
					{/* Inner wrapper: opacity animation + accessible content. */}
					<Container
						id={`popover-${effectivePopoverId}`}
						onKeyDown={handleKeyDown}
						style={{
							transitionDuration: `${transitionDuration}ms`,
							...style,
						}}
						className={cn(
							'overflow-auto rounded-xl bg-background p-4 shadow-lg transition-opacity will-change-[opacity] outline-none backface-hidden transform-3d',
							isVisible ? 'opacity-100' : 'opacity-0',
							className,
						)}
						data-slot="PopoverContent"
						aria-modal="false"
						tabIndex={-1}
						{...props}
					>
						{children}
					</Container>
				</Container>
			</FocusTrap>
		</Portal>
	);
}

/**
 * @description A button that closes a specific popover by id.
 * @param {PopoverClosePropsType} props - The props for the PopoverClose component.
 * @returns {JSX.Element} The PopoverClose component.
 */
export function PopoverClose({
	popoverId: popoverIdProp,
	onClick,
	children,
	...props
}: PopoverClosePropsType): JSX.Element {
	const { defaultPopoverId, store, open, onOpenChange } = usePopoverContext();
	const effectivePopoverId = popoverIdProp ?? defaultPopoverId;

	const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		if (open !== undefined) {
			onOpenChange?.(false);
			onClick?.(event);
			return;
		}

		store.close(effectivePopoverId);
		onClick?.(event);
	};

	return (
		<Button
			onClick={handleClick}
			variant="ghost"
			size="icon-sm"
			data-slot="PopoverClose"
			aria-label="Close popover"
			aria-controls={`popover-${effectivePopoverId}`}
			{...props}
		>
			{children ?? <XIcon className="size-4" />}
		</Button>
	);
}

/**
 * @description Title wrapper used to display content in a popover format.
 * @returns {JSX.Element} The PopoverTitle component.
 */
export function PopoverTitle({ as = 'title', ...props }: PopoverTitlePropsType): JSX.Element {
	return <Text as={as} data-slot="popover-title" {...props} />;
}

/**
 * @description Description wrapper used to display content in a popover format.
 * @returns {JSX.Element} The PopoverDescription component.
 */
export function PopoverDescription({ as = 'subtitle', className, ...props }: PopoverDescriptionPropsType): JSX.Element {
	return (
		<Text
			as={as}
			data-slot="popover-description"
			className={cn('font-medium text-muted-foreground', className)}
			{...props}
		/>
	);
}
