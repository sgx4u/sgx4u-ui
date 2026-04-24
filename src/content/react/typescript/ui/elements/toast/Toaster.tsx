'use client';

import { JSX, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon, XIcon } from 'lucide-react';

import { ToastDefaultOptionsType, ToastItemType, ToastPosition, ToastPromiseStatus, ToastVariant } from './toast.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { getSnapshot, removeToast, requestDismiss, setToastDefaults, subscribe } from './toast.store';

import { Button } from '../button';
import { Container } from '../container';
import { SpinLoader } from '../loader';
import { Portal } from '../portal';
import { Text } from '../text';

/** Stacked overlap in pixels. */
const STACK_OVERLAP = 32;

/** Approximate toast height for positioning. */
const TOAST_HEIGHT = 65;

/** Exit = slide towards where it came from (same as enter "from"). */
const EXIT_DURATION_MS = 300;

/**
 * @description Icon for variant (loading for promise pending).
 * @returns {JSX.Element} The toast icon element.
 */
function ToastIcon({
	variant,
	promiseStatus,
	className,
}: {
	variant: ToastVariant;
	promiseStatus?: ToastPromiseStatus;
	className?: string;
}): JSX.Element {
	const isPending = variant === 'promise' && promiseStatus === 'pending';
	if (isPending) return <SpinLoader className={cn(className)} />;

	switch (variant) {
		case 'success':
			return <CircleCheckIcon className={cn('text-success-dark', className)} />;
		case 'error':
			return <OctagonXIcon className={cn('text-danger-dark', className)} />;
		case 'warn':
			return <TriangleAlertIcon className={cn('text-warn-dark', className)} />;
		case 'info':
			return <InfoIcon className={cn('text-secondary-dark', className)} />;
		default:
			return <InfoIcon className={cn('text-foreground', className)} />;
	}
}

/** Variants for toast item styling. */
const { variants: toastVariants } = makeVariants({
	base: 'flex w-80 items-start gap-2 rounded-lg border bg-background px-4 py-3 shadow-lg transition-opacity',
	variants: {},
	default: { variant: 'default' },
});

/** Position classes for the toast stack container. */
const positionClasses: Record<ToastPosition, string> = {
	'top-right': 'top-4 right-4',
	'top-left': 'top-4 left-4',
	'top-center': 'top-4 left-1/2 -translate-x-1/2',
	'bottom-right': 'bottom-4 right-4',
	'bottom-left': 'bottom-4 left-4',
	'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
	center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

/** Slide direction classes per position (small offset, not full edge). */
const slideEnterClasses: Record<string, { from: string; to: string }> = {
	'top-right': { from: 'translate-x-6 opacity-0', to: 'translate-x-0 opacity-100' },
	'bottom-right': { from: 'translate-x-6 opacity-0', to: 'translate-x-0 opacity-100' },
	'top-left': { from: '-translate-x-6 opacity-0', to: 'translate-x-0 opacity-100' },
	'bottom-left': { from: '-translate-x-6 opacity-0', to: 'translate-x-0 opacity-100' },
	'top-center': { from: '-translate-y-6 opacity-0', to: 'translate-y-0 opacity-100' },
	'bottom-center': { from: 'translate-y-6 opacity-0', to: 'translate-y-0 opacity-100' },
	center: { from: 'scale-[0.98] opacity-0', to: 'scale-100 opacity-100' },
};

/** Props for the Toaster component. */
type ToasterPropsType = {
	/** Default options applied to all toasts (position, duration, dismissible). */
	defaultOptions?: ToastDefaultOptionsType;
};

/**
 * @description Renders toasts from the imperative API. Place once in your app (e.g. layout).
 * Toasts stack when idle; hover to expand and show all.
 * @returns {JSX.Element} The Toaster component.
 */
export function Toaster({ defaultOptions }: ToasterPropsType = {}): JSX.Element {
	useEffect(() => {
		if (defaultOptions) setToastDefaults(defaultOptions);
	}, [defaultOptions]);

	const { toasts, exitingIds } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	if (toasts.length === 0) return <></>;

	/** Group toasts by position. */
	const byPosition = toasts.reduce<Record<string, typeof toasts>>((accumulator, toast) => {
		const key = toast.position;
		if (!accumulator[key]) accumulator[key] = [];
		accumulator[key].push(toast);
		return accumulator;
	}, {});

	return (
		<Portal>
			<Container as="div" className="pointer-events-none fixed inset-0 z-top">
				{Object.entries(byPosition).map(([position, positionToasts]) => (
					<ToastStack
						key={position}
						position={position as ToastPosition}
						toasts={positionToasts}
						exitingIds={exitingIds}
					/>
				))}
			</Container>
		</Portal>
	);
}

/**
 * @description Stack of toasts for a position. Stacked when idle; expands on hover.
 * @returns {JSX.Element} The toast stack element.
 */
function ToastStack({
	position,
	toasts,
	exitingIds,
}: {
	position: ToastPosition;
	toasts: ToastItemType[];
	exitingIds: Set<string>;
}): JSX.Element {
	const [isHovered, setIsHovered] = useState(false);

	const reversed = [...toasts].reverse();
	const stackStep = isHovered ? TOAST_HEIGHT + 8 : TOAST_HEIGHT - STACK_OVERLAP;

	return (
		<Container as="div" className={cn(positionClasses[position], 'overflow-visible')} style={{ position: 'fixed' }}>
			<Container
				as="div"
				className="pointer-events-auto relative w-80 overflow-visible"
				style={{
					minHeight: reversed.length === 0 ? 0 : (reversed.length - 1) * stackStep + TOAST_HEIGHT,
				}}
				onMouseEnter={(): void => setIsHovered(true)}
				onMouseLeave={(): void => setIsHovered(false)}
			>
				{reversed.map((toast, index) => (
					<Container
						key={toast.id}
						as="div"
						className="absolute right-0 left-0 overflow-visible transition-transform duration-300 ease-out"
						style={{
							transform: `translateY(${index * stackStep}px)`,
							zIndex: reversed.length - index,
						}}
					>
						<ToastItem
							toast={toast}
							position={position}
							isExiting={exitingIds.has(toast.id)}
							isHovered={isHovered}
						/>
					</Container>
				))}
			</Container>
		</Container>
	);
}

/**
 * @description Single toast item with slide-in, fade-in, and exit animation.
 * @returns {JSX.Element} The toast item element.
 */
function ToastItem({
	toast,
	position,
	isExiting,
	isHovered,
}: {
	toast: ToastItemType;
	position: ToastPosition;
	isExiting: boolean;
	isHovered: boolean;
}): JSX.Element {
	const [mounted, setMounted] = useState(false);

	const durationEndRef = useRef<number>(0);
	const pausedRemainingRef = useRef<number>(0);
	const hasPausedRef = useRef<boolean>(false);

	/** Slide direction classes per position (small offset, not full edge). */
	const slide = slideEnterClasses[position] ?? slideEnterClasses['top-right'];

	/** Mount the toast item. */
	useEffect(() => {
		const frameId = requestAnimationFrame((): void => {
			requestAnimationFrame((): void => {
				setMounted(true);
			});
		});
		return (): void => cancelAnimationFrame(frameId);
	}, []);

	/** Exit the toast item. */
	useEffect(() => {
		if (!isExiting) return;
		const timeoutId = setTimeout((): void => {
			removeToast(toast.id);
		}, EXIT_DURATION_MS);
		return (): void => clearTimeout(timeoutId);
	}, [isExiting, toast.id]);

	/** Handle the duration of the toast item. */
	useEffect(() => {
		const duration = toast.duration ?? 2000;
		if (duration <= 0 || isExiting) return;

		/** Handle the hover state of the toast item. */
		if (isHovered) {
			if (durationEndRef.current > 0) {
				hasPausedRef.current = true;
				pausedRemainingRef.current = Math.max(0, durationEndRef.current - Date.now());
			}
			return;
		}

		/** Handle the remaining duration of the toast item. */
		const remaining = hasPausedRef.current ? pausedRemainingRef.current : duration;

		if (remaining <= 0) {
			requestDismiss(toast.id);
			return;
		}

		/** Handle the duration end of the toast item. */
		durationEndRef.current = Date.now() + remaining;
		hasPausedRef.current = false;

		/** Handle the timeout of the toast item. */
		const timeoutId = setTimeout((): void => {
			requestDismiss(toast.id);
		}, remaining);

		return (): void => clearTimeout(timeoutId);
	}, [toast.id, toast.duration, isHovered, isExiting]);

	/** Show the exit state of the toast item. */
	const showExit = mounted && isExiting;
	const showEntered = mounted && !isExiting;

	return (
		<Container
			as="div"
			className={cn(
				toastVariants({ variant: toast.variant }),
				'transition-all duration-300 ease-out',
				(!mounted || showExit) && slide.from,
				showEntered && slide.to,
			)}
			data-slot="toast"
			role="status"
			aria-live="polite"
			aria-atomic="true"
		>
			<ToastIcon variant={toast.variant} promiseStatus={toast.promiseStatus} className="mt-px size-5 shrink-0" />
			<Container as="div" className="flex flex-1 flex-col">
				<Text as="body-small" className="font-semibold">
					{toast.title}
				</Text>
				{toast.description && (
					<Text
						as="body-small"
						className={toast.variant === 'default' ? 'text-muted-foreground' : 'opacity-90'}
					>
						{toast.description}
					</Text>
				)}
			</Container>

			{toast.dismissible && (
				<Button
					onClick={(): void => requestDismiss(toast.id)}
					variant="ghost"
					size="icon-sm"
					className="size-4 rounded-full hover:bg-danger hover:text-danger-foreground"
					aria-label="Dismiss"
				>
					<XIcon className="size-3 stroke-4" />
				</Button>
			)}
		</Container>
	);
}
