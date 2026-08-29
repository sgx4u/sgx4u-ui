import { ContainerPropsType } from '../container';

/** Calendar selection mode. */
export type CalendarModeType = 'single' | 'range';

/** Calendar date range value. */
export type CalendarRangeValueType = { from: Date; to?: Date };

/** Calendar props type. */
export type CalendarPropsType = Omit<ContainerPropsType, 'as' | 'onChange' | 'value' | 'defaultValue'> & {
	/** Selection mode. Default - single. */
	mode?: CalendarModeType;

	/** Controlled selected value. A Date for single mode, a range object for range mode. */
	value?: Date | CalendarRangeValueType;

	/** Initial selected value for uncontrolled usage. */
	defaultValue?: Date | CalendarRangeValueType;

	/** Callback invoked when the selected date (or range) changes. */
	onValueChange?: (value: Date | CalendarRangeValueType | undefined) => void;

	/** Callback invoked when the displayed month changes (month select or previous/next). */
	onMonthChange?: (month: Date) => void;

	/** Callback invoked when the displayed year changes (year select or previous/next that crosses a year). */
	onYearChange?: (year: number) => void;

	/** Earliest selectable date, inclusive. */
	minDate?: Date;

	/** Latest selectable date, inclusive. */
	maxDate?: Date;

	/** Predicate marking additional dates as disabled. */
	disabled?: (date: Date) => boolean;

	/** Weekday index (0 = Sunday) the week should start on. Default - 0. */
	weekStartsOn?: number;

	/** Locale used to format month/weekday labels. */
	locale?: string;
};
