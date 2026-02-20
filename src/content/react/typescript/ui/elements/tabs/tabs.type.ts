import { ButtonPropsType } from '../button';
import { ContainerPropsType } from '../container';

/** Context type for the Tabs component. */
export type TabsContextType = {
	/** Active tab value. */
	value: string | number;

	/** Callback when the active tab changes. */
	onValueChange: (value: string | number) => void;

	/** Registers a trigger element by its value. */
	registerTrigger: (value: string | number, element: HTMLButtonElement | null) => void;

	/** Returns the trigger element for a given value. */
	getTriggerElement: (value: string | number) => HTMLButtonElement | null;

	/** Returns the first registered trigger value, if available. */
	getFirstTriggerValue: () => string | number | null;

	/** Tab list variant. Default - default. */
	variant?: 'default' | 'outline' | 'underline';

	/** Common props for tab triggers. */
	tabTriggerCommonProps?: ButtonPropsType;

	/** Common props for tab contents. */
	tabContentCommonProps?: ContainerPropsType;

	/** Tab indicator props. */
	tabIndicatorProps?: ContainerPropsType;
};

/** Props type for the Tabs component. */
export type TabsPropsType = ContainerPropsType & {
	/** Active tab value. */
	value?: string | number;

	/** Default active tab value. */
	defaultValue?: string | number;

	/** Callback when the active tab changes. */
	onValueChange?: (value: string | number) => void;

	/** Disable default selection. Default - false. */
	disableDefaultSelection?: boolean;

	/** Tab list variant. Default - default. */
	variant?: 'default' | 'outline' | 'underline';

	/** Common props for tab triggers. */
	tabTriggerCommonProps?: ButtonPropsType;

	/** Common props for tab contents. */
	tabContentCommonProps?: ContainerPropsType;

	/** Tab indicator props. */
	tabIndicatorProps?: ContainerPropsType;
};

/** Props type for the Tab List component. */
export type TabListPropsType = ContainerPropsType;

/** Props type for the Tab Trigger component. */
export type TabTriggerPropsType = ButtonPropsType & {
	/** Tab value. */
	value: string | number;
};

/** Props type for the Tab Content component. */
export type TabContentPropsType = ContainerPropsType & {
	/** Tab value. */
	value: string | number;
};
