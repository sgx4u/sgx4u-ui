import { ButtonPropsType } from '../button';
import { InputPropsType } from '../input';
import { PopoverContentPropsType, PopoverPropsType } from '../popover';

/** AutoComplete props type. */
export type AutoCompletePropsType = InputPropsType & {
	/** List of options to display in the dropdown. Default - []. */
	options?: Array<string>;

	/** Callback invoked when the value changes. */
	onValueChange?: (value: string) => void;

	/** Props forwarded to the root Popover element. */
	rootContainerProps?: PopoverPropsType;

	/** Props forwarded to the dropdown content element. */
	dropdownContentProps?: PopoverContentPropsType;

	/** Props forwarded to each dropdown item button. */
	dropdownItemProps?: ButtonPropsType;
};

/** AutoComplete content props type. */
export type AutoCompleteContentPropsType = PopoverContentPropsType & {
	/** List of options to display in the dropdown. */
	options: Array<string>;

	/** Callback invoked when an option is selected. */
	onOptionSelect: (option: string) => void;

	/** Props forwarded to each dropdown item button. */
	dropdownItemProps?: ButtonPropsType;
};
