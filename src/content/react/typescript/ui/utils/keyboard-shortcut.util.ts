import { isElementDisabled } from './keyboard.util';
import { capitalize } from './string.util';

/** Parsed representation of a keyboard shortcut combo. */
export type ParsedKeyboardShortcutType = {
	/** Whether the Ctrl key must be held. */
	ctrl: boolean;
	/** Whether the Meta/Cmd/Win key must be held. */
	meta: boolean;
	/** Whether the Shift key must be held. */
	shift: boolean;
	/** Whether the Alt/Option key must be held. */
	alt: boolean;
	/** The normalized, lowercased final key (e.g. "k", "enter", "arrowup"). */
	key: string;
};

/** Selector for elements that KeyboardShortcut treats as the "action" to trigger by default. */
const ACTIONABLE_ELEMENT_SELECTOR =
	'button, a[href], [role="button"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="tab"], [role="option"]';

/** Aliases for named keys, so shortcuts can be written in a friendlier form. */
const NAMED_KEY_ALIAS_MAP: Record<string, string> = {
	esc: 'escape',
	return: 'enter',
	spacebar: ' ',
	space: ' ',
	up: 'arrowup',
	down: 'arrowdown',
	left: 'arrowleft',
	right: 'arrowright',
	del: 'delete',
};

/** Display symbols/words for modifiers, keyed by platform. */
const MODIFIER_DISPLAY_MAP: Record<'ctrl' | 'meta' | 'shift' | 'alt', { mac: string; other: string }> = {
	ctrl: { mac: '⌃', other: 'Ctrl' },
	meta: { mac: '⌘', other: 'Win' },
	shift: { mac: '⇧', other: 'Shift' },
	alt: { mac: '⌥', other: 'Alt' },
};

/** Display words/symbols for named keys. */
const NAMED_KEY_DISPLAY_MAP: Record<string, string> = {
	' ': '␣',
	enter: '↵',
	escape: 'Esc',
	arrowup: '↑',
	arrowdown: '↓',
	arrowleft: '←',
	arrowright: '→',
	delete: 'Del',
	backspace: '⌫',
	tab: 'Tab',
};

/**
 * @description Reports whether the current platform is macOS, used to resolve the "mod" modifier and display symbols.
 * @returns {boolean} True on macOS/iOS, false otherwise (including during SSR).
 */
export function isMacPlatform(): boolean {
	if (typeof navigator === 'undefined') return false;
	return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}

/**
 * @description Parses a shortcut combo (e.g. "mod+k" or ["mod", "shift", "k"]) into a normalized structure used for matching and display.
 * @param {string | Array<string>} keys - The shortcut combo. Tokens are separated by "+". Supports "mod" (Cmd on macOS, Ctrl elsewhere), "ctrl", "meta"/"cmd", "shift", "alt"/"option", and a final key.
 * @returns {ParsedKeyboardShortcutType} The parsed shortcut.
 */
export function parseShortcut(keys: string | Array<string>): ParsedKeyboardShortcutType {
	const rawTokens = (Array.isArray(keys) ? keys : [keys]).flatMap((entry) => entry.split('+'));
	const tokens = rawTokens.map((token) => token.trim().toLowerCase()).filter(Boolean);

	const parsed: ParsedKeyboardShortcutType = { ctrl: false, meta: false, shift: false, alt: false, key: '' };
	const isMac = isMacPlatform();

	for (const token of tokens) {
		if (token === 'mod') {
			if (isMac) parsed.meta = true;
			else parsed.ctrl = true;
			continue;
		}
		if (token === 'ctrl' || token === 'control') {
			parsed.ctrl = true;
			continue;
		}
		if (token === 'meta' || token === 'cmd' || token === 'command') {
			parsed.meta = true;
			continue;
		}
		if (token === 'shift') {
			parsed.shift = true;
			continue;
		}
		if (token === 'alt' || token === 'option') {
			parsed.alt = true;
			continue;
		}
		parsed.key = NAMED_KEY_ALIAS_MAP[token] ?? token;
	}

	return parsed;
}

/**
 * @description Checks whether a keyboard event matches a parsed shortcut, comparing both the key and every modifier flag exactly.
 * @param {ParsedKeyboardShortcutType} parsed - The parsed shortcut to match against.
 * @param {KeyboardEvent} event - The keyboard event.
 * @returns {boolean} True when the event matches the shortcut.
 */
export function matchesShortcutEvent(parsed: ParsedKeyboardShortcutType, event: KeyboardEvent): boolean {
	if (!parsed.key) return false;
	if (event.key.toLowerCase() !== parsed.key) return false;
	if (event.ctrlKey !== parsed.ctrl) return false;
	if (event.metaKey !== parsed.meta) return false;
	if (event.shiftKey !== parsed.shift) return false;
	if (event.altKey !== parsed.alt) return false;
	return true;
}

/**
 * @description Formats a parsed shortcut into an ordered list of display tokens (one per modifier plus the final key), using platform-appropriate symbols.
 * @param {ParsedKeyboardShortcutType} parsed - The parsed shortcut to format.
 * @returns {Array<string>} The ordered display tokens.
 */
export function formatShortcutTokens(parsed: ParsedKeyboardShortcutType): Array<string> {
	const isMac = isMacPlatform();
	const tokens: Array<string> = [];

	if (parsed.ctrl) tokens.push(isMac ? MODIFIER_DISPLAY_MAP.ctrl.mac : MODIFIER_DISPLAY_MAP.ctrl.other);
	if (parsed.alt) tokens.push(isMac ? MODIFIER_DISPLAY_MAP.alt.mac : MODIFIER_DISPLAY_MAP.alt.other);
	if (parsed.shift) tokens.push(isMac ? MODIFIER_DISPLAY_MAP.shift.mac : MODIFIER_DISPLAY_MAP.shift.other);
	if (parsed.meta) tokens.push(isMac ? MODIFIER_DISPLAY_MAP.meta.mac : MODIFIER_DISPLAY_MAP.meta.other);

	if (parsed.key) {
		const namedDisplay = NAMED_KEY_DISPLAY_MAP[parsed.key];
		tokens.push(namedDisplay ?? (parsed.key.length === 1 ? parsed.key.toUpperCase() : capitalize(parsed.key)));
	}

	return tokens;
}

/**
 * @description Formats a parsed shortcut into a single display string, concatenating the symbols on macOS (e.g. "⇧⌘P") and joining with "+" elsewhere (e.g. "Ctrl+Shift+P").
 * @param {ParsedKeyboardShortcutType} parsed - The parsed shortcut to format.
 * @returns {string} The formatted shortcut string.
 */
export function formatShortcut(parsed: ParsedKeyboardShortcutType): string {
	return formatShortcutTokens(parsed).join(isMacPlatform() ? '' : '+');
}

/**
 * @description Finds the nearest actionable ancestor (button, link, or ARIA menu/tab/option control) of an element, including the element itself.
 * @param {HTMLElement | null} element - The element to search from.
 * @returns {HTMLElement | null} The nearest actionable element, or null when none is found.
 */
export function resolveActionableElement(element: HTMLElement | null): HTMLElement | null {
	if (!element) return null;
	return element.closest<HTMLElement>(ACTIONABLE_ELEMENT_SELECTOR);
}

/**
 * @description Reports whether an element is currently connected, and not hidden behind an aria-hidden or inert ancestor (e.g. a closing/closed overlay).
 * @param {HTMLElement | null} element - The element to check.
 * @returns {boolean} True when the element is active and eligible to receive a triggered shortcut.
 */
function isElementActive(element: HTMLElement | null): boolean {
	if (!element || !element.isConnected) return false;
	if (element.closest('[aria-hidden="true"]')) return false;
	if (element.closest('[inert]')) return false;
	return true;
}

/**
 * @description Reports whether a keyboard event target is an editable form control, so shortcuts can avoid interfering with typing by default.
 * @param {EventTarget | null} target - The event target.
 * @returns {boolean} True when the target is an input, textarea, select, or contenteditable element.
 */
function isEditableEventTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return true;
	return target.isContentEditable;
}

/** A single registered keyboard shortcut. */
type KeyboardShortcutEntryType = {
	/** The parsed combo to match against keydown events. */
	parsed: ParsedKeyboardShortcutType;

	/** Resolves the element to trigger. Defaults to the nearest actionable ancestor of the source element. */
	resolveTargetElement: () => HTMLElement | null;

	/** Whether the shortcut should still fire while an input/textarea/select/contenteditable is focused. */
	enableOnFormElements: boolean;

	/** Whether to call event.preventDefault() when the shortcut matches and is triggered. */
	preventDefault: boolean;

	/** Invoked with the matched event and the resolved target element once every guard passes. */
	handleTrigger: (event: KeyboardEvent, targetElement: HTMLElement) => void;
};

/** Registered shortcut entries, in registration order. Iterated newest-first so the innermost/topmost open layer wins on conflicts. */
const registeredShortcutEntries: Array<KeyboardShortcutEntryType> = [];

/** Whether the shared document keydown listener is currently attached. */
let isDocumentListenerAttached = false;

/**
 * @description Shared document-level keydown handler. Finds the most recently registered active entry that matches the event and triggers it.
 * @param {KeyboardEvent} event - The keydown event.
 * @returns {void}
 */
function handleDocumentKeyDown(event: KeyboardEvent): void {
	if (event.repeat) return;

	const isEditableTarget = isEditableEventTarget(event.target);

	for (let index = registeredShortcutEntries.length - 1; index >= 0; index--) {
		const entry = registeredShortcutEntries[index];

		if (!matchesShortcutEvent(entry.parsed, event)) continue;
		if (isEditableTarget && !entry.enableOnFormElements) continue;

		const targetElement = entry.resolveTargetElement();
		if (!targetElement) continue;
		if (!isElementActive(targetElement) || isElementDisabled(targetElement)) continue;

		if (entry.preventDefault) event.preventDefault();
		entry.handleTrigger(event, targetElement);
		return;
	}
}

/**
 * @description Registers a keyboard shortcut entry with the shared global manager, lazily attaching a single document-level keydown listener.
 * @param {KeyboardShortcutEntryType} entry - The shortcut entry to register.
 * @returns {() => void} A cleanup function that unregisters the entry, detaching the shared listener once no entries remain.
 */
export function registerKeyboardShortcut(entry: KeyboardShortcutEntryType): () => void {
	registeredShortcutEntries.push(entry);

	if (!isDocumentListenerAttached) {
		document.addEventListener('keydown', handleDocumentKeyDown, true);
		isDocumentListenerAttached = true;
	}

	return function unregisterKeyboardShortcut(): void {
		const index = registeredShortcutEntries.indexOf(entry);
		if (index !== -1) registeredShortcutEntries.splice(index, 1);

		if (registeredShortcutEntries.length === 0 && isDocumentListenerAttached) {
			document.removeEventListener('keydown', handleDocumentKeyDown, true);
			isDocumentListenerAttached = false;
		}
	};
}
