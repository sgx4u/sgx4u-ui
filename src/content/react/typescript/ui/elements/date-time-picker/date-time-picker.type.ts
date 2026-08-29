import { ButtonPropsType } from '../button';
import { InputPropsType } from '../input';

/** Level of date/time precision the picker collects. */
export type DateTimePickerGranularityType = 'date' | 'datetime';

/** Date Time Picker props type. */
export type DateTimePickerPropsType = Omit<
	ButtonPropsType,
	'asChild' | 'children' | 'onChange' | 'value' | 'defaultValue' | 'type' | 'variant'
> & {
	/** Controlled selected date. */
	value?: Date;

	/** Initial selected date for uncontrolled usage. */
	defaultValue?: Date;

	/** Callback invoked when the selected date changes. */
	onValueChange?: (value: Date | undefined) => void;

	/** Whether to collect a time alongside the date. Default - date. */
	granularity?: DateTimePickerGranularityType;

	/** Placeholder shown when no date is selected. */
	placeholder?: string;

	/** Form field name. */
	name?: string;

	/** Disables the trigger. */
	disabled?: boolean;

	/** Visual state applied to the trigger border. Default - default. */
	state?: InputPropsType['state'];

	/** Earliest selectable date, inclusive. */
	minDate?: Date;

	/** Latest selectable date, inclusive. */
	maxDate?: Date;
};
