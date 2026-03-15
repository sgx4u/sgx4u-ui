import type { ToastDefaultOptionsType, ToastItemType, ToastOptionsType, ToastVariant } from './toast.type';

/** Listener function type. */
type Listener = () => void;

/** Toasts array. */
let toasts: ToastItemType[] = [];

/** User-provided default options. */
let defaultOptions: ToastDefaultOptionsType = {};
const exitingIds = new Set<string>();
const listeners = new Set<Listener>();

/** Cached snapshot. */
let cachedSnapshot: { toasts: ToastItemType[]; exitingIds: Set<string> } | null = null;
let cachedVersion = -1;
let snapshotVersion = 0;

/** Default duration in milliseconds. */
const DEFAULT_DURATION = 2000;

/**
 * @description Generate a unique ID.
 * @returns {string} The unique ID.
 */
function generateId(): string {
	return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @description Notify all listeners of a change.
 * @returns {void}
 */
function notify(): void {
	listeners.forEach((listener) => listener());
}

/**
 * @description Set default options for all toasts. Call from Toaster on mount.
 * @param {ToastDefaultOptionsType} options - The default options.
 * @returns {void}
 */
export function setToastDefaults(options: ToastDefaultOptionsType): void {
	defaultOptions = { ...defaultOptions, ...options };
}

/**
 * @description Add a toast to the store.
 * @param {ToastOptionsType} options - The options for the toast.
 * @param {ToastVariant} variant - The variant of the toast.
 * @param {object} extra - Extra fields (e.g. promiseStatus for promise toasts).
 * @returns {string} The ID of the toast.
 */
export function addToast(
	options: ToastOptionsType,
	variant: ToastVariant,
	extra?: Partial<Pick<ToastItemType, 'promiseStatus'>>,
): string {
	const id = generateId();
	const merged = { ...defaultOptions, ...options };
	const duration = variant === 'promise' ? 0 : (merged.duration ?? DEFAULT_DURATION);

	/** Create the toast item. */
	const toast: ToastItemType = {
		id,
		title: options.title,
		description: options.description,
		variant,
		position: merged.position ?? 'top-right',
		dismissible: merged.dismissible ?? true,
		duration,
		createdAt: Date.now(),
		...extra,
	};

	toasts = [...toasts, toast];
	snapshotVersion++;
	notify();
	return id;
}

/**
 * @description Update a toast (e.g. when promise fulfills or rejects).
 * @param {string} id - The ID of the toast.
 * @param {Partial<Pick<ToastItemType, 'title' | 'description' | 'variant' | 'promiseStatus'>>} updates - The updates.
 * @returns {void}
 */
export function updateToast(
	id: string,
	updates: Partial<Pick<ToastItemType, 'title' | 'description' | 'variant' | 'promiseStatus' | 'duration'>>,
): void {
	const index = toasts.findIndex((toast) => toast.id === id);
	if (index === -1) return;
	toasts = toasts.map((toast) => (toast.id === id ? { ...toast, ...updates } : toast));
	snapshotVersion++;
	notify();
}

/**
 * @description Request dismiss (triggers exit animation). Call removeToast after animation.
 * @param {string} id - The ID of the toast.
 * @returns {void}
 */
export function requestDismiss(id: string): void {
	if (exitingIds.has(id)) return;
	exitingIds.add(id);
	snapshotVersion++;
	notify();
}

/**
 * @description Remove a toast from the store.
 * @param {string} id - The ID of the toast.
 * @returns {void}
 */
export function removeToast(id: string): void {
	exitingIds.delete(id);
	toasts = toasts.filter((toast) => toast.id !== id);
	snapshotVersion++;
	notify();
}

/**
 * @description Get current toasts.
 * @returns {ToastItemType[]} The current toasts.
 */
export function getToasts(): ToastItemType[] {
	return toasts;
}

/**
 * @description Snapshot for useSyncExternalStore (toasts + exiting IDs). Cached to avoid infinite loops.
 * @returns {{ toasts: ToastItemType[]; exitingIds: Set<string> }} The snapshot.
 */
export function getSnapshot(): { toasts: ToastItemType[]; exitingIds: Set<string> } {
	if (cachedSnapshot !== null && cachedVersion === snapshotVersion) {
		return cachedSnapshot;
	}

	/** Update the cached snapshot. */
	cachedVersion = snapshotVersion;
	cachedSnapshot = { toasts, exitingIds: new Set(exitingIds) };
	return cachedSnapshot;
}

/**
 * @description Subscribe to toast changes.
 * @param {Listener} listener - The listener to subscribe to.
 * @returns {() => void} The unsubscribe function.
 */
export function subscribe(listener: Listener): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
