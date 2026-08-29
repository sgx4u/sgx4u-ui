import { ButtonPropsType } from '../button';
import { ContainerPropsType } from '../container';

/** Collapsible context value shared across sub-components. */
export type CollapsibleContextType = {
	/** Whether the panel is currently open. */
	open: boolean;

	/** Toggles the open state. */
	onToggle: () => void;

	/** Registers the content element so the root can drive its slide animation. */
	registerContent: (element: HTMLElement | null) => void;
};

/** Collapsible props type. */
export type CollapsiblePropsType = Omit<ContainerPropsType, 'as'> & {
	/** Controlled open state. */
	open?: boolean;

	/** Initial open state for uncontrolled usage. Default - false. */
	defaultOpen?: boolean;

	/** Callback invoked when the open state changes. */
	onOpenChange?: (open: boolean) => void;

	/** Animation speed in milliseconds. Default - 150. */
	speed?: number;
};

/** Collapsible trigger props type. */
export type CollapsibleTriggerPropsType = ButtonPropsType;

/** Collapsible content props type. */
export type CollapsibleContentPropsType = ContainerPropsType;
