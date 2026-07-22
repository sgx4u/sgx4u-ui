import { ReactNode } from 'react';

import { ContainerPropsType } from '../container';
import { KeyboardShortcutVariantTypes } from './KeyboardShortcut';

/** Props type for the KeyboardShortcut component. */
export type KeyboardShortcutPropsType = Omit<ContainerPropsType, 'as'> & {
	/** The shortcut combo to listen for and display (e.g. "mod+k" or ["mod", "shift", "k"]). "mod" resolves to Cmd on macOS and Ctrl elsewhere. */
	keys: string | Array<string>;

	/** Called instead of clicking the resolved target when the shortcut is triggered. */
	onTrigger?: (event: KeyboardEvent) => void;

	/** An explicit element (via ref) or CSS selector to trigger, instead of the nearest actionable ancestor (button, link, or ARIA menu item) this component is nested inside. */
	target?: { current: HTMLElement | null } | string;

	/** If true, the shortcut is not registered and nothing is rendered. */
	disabled?: boolean;

	/** If true, renders nothing but keeps the shortcut active. Default - false. */
	hidden?: boolean;

	/** Custom visual content, replacing the generated key badges. */
	children?: ReactNode;

	/** Whether the shortcut should still fire while an input/textarea/select/contenteditable is focused. Default - false. */
	enableOnFormElements?: boolean;

	/** Whether to call event.preventDefault() when the shortcut is triggered. Default - true. */
	preventDefault?: boolean;

	/** Size of the rendered key badges. Default - default. */
	size?: typeof KeyboardShortcutVariantTypes.size;

	/** The HTML element to render as. Default - span. */
	as?: ContainerPropsType['as'];
};
