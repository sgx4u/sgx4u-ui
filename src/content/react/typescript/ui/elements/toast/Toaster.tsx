'use client';

import { JSX, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon, XIcon } from 'lucide-react';

import {
	ToastDefaultOptionsType,
	ToastItemType,
	ToastPosition,
	ToastPromiseStatus,
	ToastVariantType,
} from './toast.type';
import { cn } from '../../utils/styles.util';

import { getSnapshot, removeToast, requestDismiss, setToastDefaults, subscribe } from './toast.store';

import { Button } from '../button';
import { Container } from '../container';
import { SpinLoader } from '../loader';
import { Portal } from '../portal';
import { Text } from '../text';

/** Time the exit animation runs before the toast is removed from the store. */
const EXIT_DURATION_MS = 300;

/** Use a layout effect on the client and a plain effect during SSR to avoid warnings. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * @description Icon for a toast variant (spinner while a promise is pending).
 * @returns {JSX.Element} The toast icon element.
 */
function ToastIcon({
	variant,
	promiseStatus,
	className,
}: {
	variant: ToastVariantType;
	promiseStatus?: ToastPromiseStatus;
	className?: string;
}): JSX.Element {
	const isPending = variant === 'promise' && promiseStatus === 'pending';
	if (isPending) return <SpinLoader className={className} />;

	switch (variant) {
		case 'success':
			return <CircleCheckIcon className={cn('text-success-dark', className)} />;
		case 'danger':
			return <OctagonXIcon className={cn('text-danger-dark', className)} />;
		case 'warn':
			return <TriangleAlertIcon className={cn('text-warn-dark', className)} />;
		case 'info':
			return <InfoIcon className={cn('text-secondary-dark', className)} />;
		default:
			return <InfoIcon className={cn('text-foreground', className)} />;
	}
}

/** Anchor classes for a toast stack per position. */
const positionClasses: Record<ToastPosition, string> = {
	'top-right': 'top-4 right-4',
	'top-left': 'top-4 left-4',
	'top-center': 'top-4 left-1/2 -translate-x-1/2',
	'bottom-right': 'bottom-4 right-4',
	'bottom-left': 'bottom-4 left-4',
	'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
	center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

/** Enter/exit slide offsets per position (resting state is `to`). */
const slideClasses: Record<ToastPosition, { from: string; to: string }> = {
	'top-right': { from: 'translate-x-6 opacity-0', to: 'translate-x-0 opacity-100' },
	'bottom-right': { from: 'translate-x-6 opacity-0', to: 'translate-x-0 opacity-100' },
	'top-left': { from: '-translate-x-6 opacity-0', to: 'translate-x-0 opacity-100' },
	'bottom-left': { from: '-translate-x-6 opacity-0', to: 'translate-x-0 opacity-100' },
	'top-center': { from: '-translate-y-6 opacity-0', to: 'translate-y-0 opacity-100' },
	'bottom-center': { from: 'translate-y-6 opacity-0', to: 'translate-y-0 opacity-100' },
	center: { from: 'scale-95 opacity-0', to: 'scale-100 opacity-100' },
};

/** Props for the Toaster component. */
type ToasterPropsType = {
	/** Default options applied to all toasts (position, duration, dismissible). */
	defaultOptions?: ToastDefaultOptionsType;
};

/**
 * @description Renders toasts from the imperative API. Place once in your app (e.g. layout).
 * @returns {JSX.Element} The Toaster component.
 */
export function Toaster({ defaultOptions }: ToasterPropsType = {}): JSX.Element {
	useEffect(() => {
		if (defaultOptions) setToastDefaults(defaultOptions);
	}, [defaultOptions]);

	const { toasts, exitingIds } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	if (toasts.length === 0) return <></>;

	/** Group toasts by their position so each corner renders its own stack. */
	const toastsByPosition = toasts.reduce<Record<string, Array<ToastItemType>>>((accumulator, toast) => {
		(accumulator[toast.position] ??= []).push(toast);
		return accumulator;
	}, {});

	return (
		<Portal>
			<Container className="pointer-events-none fixed inset-0 z-top">
				{Object.entries(toastsByPosition).map(([position, positionToasts]) => (
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
 * @description Vertical stack of toasts anchored to a position. Newest toast sits closest to the edge.
 * @returns {JSX.Element} The toast stack element.
 */
function ToastStack({
	position,
	toasts,
	exitingIds,
}: {
	position: ToastPosition;
	toasts: Array<ToastItemType>;
	exitingIds: Set<string>;
}): JSX.Element {
	const isBottom = position.startsWith('bottom');
	const orderedToasts = [...toasts].reverse();

	return (
		<Container
			className={cn(
				'absolute flex w-80 flex-col gap-1.5',
				positionClasses[position],
				isBottom && 'flex-col-reverse',
			)}
		>
			{orderedToasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} position={position} isExiting={exitingIds.has(toast.id)} />
			))}
		</Container>
	);
}

/**
 * @description Single toast that slides and fades in on enter and out on exit.
 * @returns {JSX.Element} The toast item element.
 */
function ToastItem({
	toast,
	position,
	isExiting,
}: {
	toast: ToastItemType;
	position: ToastPosition;
	isExiting: boolean;
}): JSX.Element {
	const [isMounted, setIsMounted] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	const outerRef = useRef<HTMLDivElement>(null);
	const previousTopRef = useRef<number | null>(null);
	const durationEndRef = useRef<number>(0);
	const pausedRemainingRef = useRef<number>(0);
	const hasPausedRef = useRef<boolean>(false);

	const slide = slideClasses[position];
	const isAssertive = toast.variant === 'danger' || toast.variant === 'warn';

	/** Animate layout shifts (FLIP) so neighbouring toasts slide up or down instead of jumping. */
	useIsomorphicLayoutEffect(() => {
		const element = outerRef.current;
		if (!element) return;

		element.style.transition = 'none';
		element.style.transform = '';
		const currentTop = element.getBoundingClientRect().top;
		const previousTop = previousTopRef.current;
		previousTopRef.current = currentTop;

		if (previousTop === null || previousTop === currentTop) return;

		element.style.transform = `translateY(${previousTop - currentTop}px)`;
		element.getBoundingClientRect();

		const frameId = requestAnimationFrame((): void => {
			element.style.transition = `transform ${EXIT_DURATION_MS}ms ease-out`;
			element.style.transform = 'translateY(0px)';
		});
		return (): void => cancelAnimationFrame(frameId);
	});

	/** Defer the entered state by two frames so the initial closed state paints first. */
	useEffect(() => {
		const frameId = requestAnimationFrame((): void => {
			requestAnimationFrame((): void => setIsMounted(true));
		});
		return (): void => cancelAnimationFrame(frameId);
	}, []);

	/** Remove the toast from the store once its exit animation has finished. */
	useEffect(() => {
		if (!isExiting) return;
		const timeoutId = setTimeout((): void => removeToast(toast.id), EXIT_DURATION_MS);
		return (): void => clearTimeout(timeoutId);
	}, [isExiting, toast.id]);

	/** Auto-dismiss after the duration, pausing while hovered. A duration of 0 keeps it open. */
	useEffect(() => {
		if (toast.duration <= 0 || isExiting) return;

		if (isHovered) {
			if (durationEndRef.current > 0) {
				hasPausedRef.current = true;
				pausedRemainingRef.current = Math.max(0, durationEndRef.current - Date.now());
			}
			return;
		}

		const remaining = hasPausedRef.current ? pausedRemainingRef.current : toast.duration;
		if (remaining <= 0) {
			requestDismiss(toast.id);
			return;
		}

		durationEndRef.current = Date.now() + remaining;
		hasPausedRef.current = false;

		const timeoutId = setTimeout((): void => requestDismiss(toast.id), remaining);
		return (): void => clearTimeout(timeoutId);
	}, [toast.id, toast.duration, isHovered, isExiting]);

	const isVisible = isMounted && !isExiting;

	return (
		<Container ref={outerRef} className="w-full">
			<Container
				className={cn(
					'pointer-events-auto flex w-full items-start gap-2 rounded-lg border bg-background px-4 py-3 transition-[translate,scale,opacity] duration-300 ease-out',
					isVisible ? slide.to : slide.from,
				)}
				data-slot="toast"
				role={isAssertive ? 'alert' : 'status'}
				aria-live={isAssertive ? 'assertive' : 'polite'}
				aria-atomic="true"
				onMouseEnter={(): void => setIsHovered(true)}
				onMouseLeave={(): void => setIsHovered(false)}
			>
				<ToastIcon
					variant={toast.variant}
					promiseStatus={toast.promiseStatus}
					className="mt-px size-5 shrink-0"
				/>
				<Container className="flex flex-1 flex-col">
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
		</Container>
	);
}
