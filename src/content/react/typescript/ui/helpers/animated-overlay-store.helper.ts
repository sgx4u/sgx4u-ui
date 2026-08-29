/** Internal state record for a single overlay instance. */
export type OverlayRecordType = {
	/** Whether the overlay DOM node is currently mounted. */
	isMounted: boolean;

	/** Current lifecycle phase used to drive enter/exit animations. */
	phase: 'closed' | 'opening' | 'open' | 'closing';
};

/** Store state keyed by overlay id. */
export type OverlayStateType = Record<string, OverlayRecordType>;

/**
 * @description Generic external store for managing multiple animated overlays by id.
 * Supports open, close, toggle, and destroy operations with animation-lifecycle phases.
 */
export type AnimatedOverlayStoreType = {
	/** Returns the current snapshot of all overlay records. */
	getSnapshot: () => OverlayStateType;

	/** Subscribes to state changes. Returns an unsubscribe function. */
	subscribe: (listener: () => void) => () => void;

	/** Opens the overlay identified by the given id, transitioning through 'opening' → 'open'. */
	open: (overlayId: string) => void;

	/** Closes the overlay identified by the given id, transitioning through 'closing' → unmount. */
	close: (overlayId: string) => void;

	/** Toggles the overlay identified by the given id between open and closed. */
	toggle: (overlayId: string) => void;

	/** Removes the record for the given id from the store, freeing memory on unmount. */
	destroy: (overlayId: string) => void;
};

/**
 * @description Generic factory that creates an external store for managing multiple animated overlays (dialogs, sheets, popovers, etc.) by id.
 * Uses a two-frame open sequence to ensure the browser paints the initial state before the open class is applied.
 * Schedules unmount after the exit animation duration to allow CSS transitions to complete.
 * @param {(overlayId: string) => number} getAnimationDurationMs - Returns the animation duration in ms for a given overlay id.
 * @returns {AnimatedOverlayStoreType} The animated overlay store.
 */
export function createAnimatedOverlayStore(
	getAnimationDurationMs: (overlayId: string) => number,
): AnimatedOverlayStoreType {
	/** State keyed by overlay id. Replaced immutably on every update. */
	let state: OverlayStateType = Object.create(null) as OverlayStateType;

	/** Subscriber callbacks notified on every state change. */
	const listeners = new Set<() => void>();

	/** Pending unmount timers keyed by overlay id. */
	const closeTimers = new Map<string, number>();

	/**
	 * @description Notifies all subscribers of a state change.
	 * @returns {void}
	 */
	function emit(): void {
		listeners.forEach((listener) => listener());
	}

	/**
	 * @description Returns the existing record for an id, or creates a default closed record if none exists.
	 * @param {string} overlayId - The overlay id.
	 * @returns {OverlayRecordType} The record for the given id.
	 */
	function ensureRecord(overlayId: string): OverlayRecordType {
		const existing = state[overlayId];
		if (existing) return existing;

		const created: OverlayRecordType = { isMounted: false, phase: 'closed' };
		state = { ...state, [overlayId]: created };
		return created;
	}

	/**
	 * @description Replaces the record for an id and notifies subscribers.
	 * @param {object} props - The parameters.
	 * @param {string} props.overlayId - The overlay id.
	 * @param {OverlayRecordType} props.next - The replacement record.
	 * @returns {void}
	 */
	function setRecord({ overlayId, next }: { overlayId: string; next: OverlayRecordType }): void {
		state = { ...state, [overlayId]: next };
		emit();
	}

	/**
	 * @description Cancels any pending unmount timer for the given id.
	 * @param {string} overlayId - The overlay id.
	 * @returns {void}
	 */
	function clearCloseTimer(overlayId: string): void {
		const existing = closeTimers.get(overlayId);
		if (existing !== undefined) {
			clearTimeout(existing);
			closeTimers.delete(overlayId);
		}
	}

	/**
	 * @description Schedules unmount after the exit animation duration has elapsed.
	 * @param {string} overlayId - The overlay id.
	 * @returns {void}
	 */
	function scheduleUnmount(overlayId: string): void {
		clearCloseTimer(overlayId);
		const durationMs = getAnimationDurationMs(overlayId);

		const timerId = setTimeout(() => {
			closeTimers.delete(overlayId);

			const record = ensureRecord(overlayId);
			if (record.phase !== 'closing') return;

			setRecord({ overlayId, next: { isMounted: false, phase: 'closed' } });
		}, durationMs);

		closeTimers.set(overlayId, Number(timerId));
	}

	/**
	 * @description Opens the overlay, using a double requestAnimationFrame to allow the browser to paint the initial state before transitioning to 'open'.
	 * @param {string} overlayId - The overlay id.
	 * @returns {void}
	 */
	function open(overlayId: string): void {
		clearCloseTimer(overlayId);

		const record = ensureRecord(overlayId);
		if (record.phase === 'open' || record.phase === 'opening') return;

		setRecord({ overlayId, next: { isMounted: true, phase: 'opening' } });
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const latest = ensureRecord(overlayId);
				if (!latest.isMounted) return;
				if (latest.phase !== 'opening') return;
				setRecord({ overlayId, next: { isMounted: true, phase: 'open' } });
			});
		});
	}

	/**
	 * @description Closes the overlay by transitioning to 'closing' and scheduling unmount.
	 * @param {string} overlayId - The overlay id.
	 * @returns {void}
	 */
	function close(overlayId: string): void {
		const record = ensureRecord(overlayId);
		if (!record.isMounted) return;
		if (record.phase === 'closing' || record.phase === 'closed') return;

		setRecord({ overlayId, next: { isMounted: true, phase: 'closing' } });
		scheduleUnmount(overlayId);
	}

	/**
	 * @description Toggles the overlay between open and closed.
	 * @param {string} overlayId - The overlay id.
	 * @returns {void}
	 */
	function toggle(overlayId: string): void {
		const record = ensureRecord(overlayId);
		if (record.isMounted && (record.phase === 'open' || record.phase === 'opening')) {
			close(overlayId);
			return;
		}
		open(overlayId);
	}

	/**
	 * @description Removes the record for the given id from the store, freeing memory. Should be called when the host component unmounts.
	 * @param {string} overlayId - The overlay id.
	 * @returns {void}
	 */
	function destroy(overlayId: string): void {
		clearCloseTimer(overlayId);

		if (!(overlayId in state)) return;

		const { [overlayId]: _removed, ...rest } = state;
		state = rest as OverlayStateType;
		emit();
	}

	return {
		getSnapshot: () => state,
		subscribe: (listener: () => void) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		open,
		close,
		toggle,
		destroy,
	};
}
