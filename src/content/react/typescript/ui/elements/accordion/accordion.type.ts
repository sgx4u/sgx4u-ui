import { ButtonPropsType, ButtonVariantTypes } from '../button';
import { ContainerPropsType } from '../container';

/** Accordion context type. */
export type AccordionContextType = {
	/** Values of the open items for controlled usage. */
	openItems: Array<string>;

	/** Callback invoked when an item is toggled. */
	onToggle: (itemValue: string) => void;

	/** Registers an item or body element. */
	registerItem: (data: { value: string; element?: HTMLElement; type?: 'item' | 'body' }) => void;

	/** Whether only one or multiple items can be open at a time. */
	type: 'single' | 'multiple';
};

/** Accordion props type. */
export type AccordionPropsType = ContainerPropsType & {
	/** Values of the open items for controlled usage. */
	openItems?: Array<string>;

	/** Initial values of the open items for uncontrolled usage. */
	defaultOpenItems?: Array<string>;

	/** Callback invoked when the values of the open items change. */
	onOpenItemsChange?: (value: Array<string>) => void;

	/** Whether only one or multiple items can be open at a time. Default - multiple. */
	type?: 'single' | 'multiple';

	/** Animation speed in milliseconds. Default - 150. */
	speed?: number;
};

/** Accordion item context type. */
export type AccordionItemContextType = {
	/** Unique value for this item. */
	value: string;
};

/** Accordion item props type. */
export type AccordionItemPropsType = ContainerPropsType & {
	/** Unique value for this item. */
	value: string;
};

/** Accordion trigger props type. */
export type AccordionTriggerPropsType = Omit<ButtonPropsType, 'variant'> & {
	/** Visual style of the trigger button. Default - ghost. */
	variant?: (typeof ButtonVariantTypes)['variant'];

	/** Hide the chevron icon. */
	hideArrow?: boolean;
};

/** Accordion content props type. */
export type AccordionContentPropsType = ContainerPropsType;
