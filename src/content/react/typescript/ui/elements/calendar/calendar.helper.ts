import { CalendarRangeValueType } from './calendar.type';

/**
 * @description Returns a local-calendar day timestamp at midnight, without mutating the input date.
 * @param {Date} date - The date to normalize.
 * @returns {number} Midnight timestamp for that local calendar day.
 */
export function getDayTimestamp(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * @description Checks whether two dates fall on the same calendar day, ignoring time.
 * @param {Date} first - The first date.
 * @param {Date} second - The second date.
 * @returns {boolean} True when both dates share the same year, month, and day.
 */
export function isSameDay(first: Date, second: Date): boolean {
	return (
		first.getFullYear() === second.getFullYear() &&
		first.getMonth() === second.getMonth() &&
		first.getDate() === second.getDate()
	);
}

/**
 * @description Checks whether a date falls within an inclusive range.
 * @param {object} props - The range parameters.
 * @param {Date} props.date - The date to check.
 * @param {Date} props.start - The start of the range.
 * @param {Date} props.end - The end of the range.
 * @returns {boolean} True when the date is within [start, end].
 */
export function isWithinRange({ date, start, end }: { date: Date; start: Date; end: Date }): boolean {
	const time = getDayTimestamp(date);
	const startTime = getDayTimestamp(start);
	const endTime = getDayTimestamp(end);
	return time >= Math.min(startTime, endTime) && time <= Math.max(startTime, endTime);
}

/** A single day cell within a rendered calendar month. */
export type CalendarDayType = {
	/** The date represented by this cell. */
	date: Date;

	/** Stable local day key (`YYYY-M-D`) for React lists and lookups. */
	dayKey: string;

	/** Midnight timestamp for this local calendar day. */
	dayTimestamp: number;

	/** Whether the date belongs to the currently displayed month. */
	isCurrentMonth: boolean;
};

/** Cache of month matrices keyed by year, month index, and weekStartsOn. */
const monthMatrixCache = new Map<string, Array<CalendarDayType>>();

/** Cache of weekday labels keyed by locale and weekStartsOn. */
const weekdayLabelsCache = new Map<string, Array<string>>();

/** Cache of month names keyed by locale. */
const monthNamesCache = new Map<string, Array<string>>();

/**
 * @description Builds a stable local-calendar day key for list reconciliation.
 * @param {Date} date - The date to key.
 * @returns {string} A `YYYY-M-D` key.
 */
export function getDayKey(date: Date): string {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * @description Builds the full 6-week day matrix for a given month, including the trailing/leading days from adjacent months needed to fill each week. Results are cached per year/month/weekStartsOn.
 * @param {object} props - The matrix parameters.
 * @param {Date} props.month - Any date within the target month.
 * @param {number} [props.weekStartsOn] - The weekday index (0 = Sunday) the week should start on. Default - 0.
 * @returns {Array<CalendarDayType>} A flat array of 42 day cells (6 weeks x 7 days).
 */
export function getCalendarMonthMatrix({
	month,
	weekStartsOn = 0,
}: {
	month: Date;
	weekStartsOn?: number;
}): Array<CalendarDayType> {
	const year = month.getFullYear();
	const monthIndex = month.getMonth();
	const cacheKey = `${year}-${monthIndex}-${weekStartsOn}`;
	const cachedMatrix = monthMatrixCache.get(cacheKey);
	if (cachedMatrix) return cachedMatrix;

	const firstDayOfMonth = new Date(year, monthIndex, 1);
	const leadingOffset = (firstDayOfMonth.getDay() - weekStartsOn + 7) % 7;
	const gridStart = new Date(year, monthIndex, 1 - leadingOffset);

	const matrix = Array.from({ length: 42 }, (_, index) => {
		const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
		return {
			date,
			dayKey: getDayKey(date),
			dayTimestamp: getDayTimestamp(date),
			isCurrentMonth: date.getMonth() === monthIndex,
		};
	});

	monthMatrixCache.set(cacheKey, matrix);
	return matrix;
}

/**
 * @description Returns the localized abbreviated weekday labels in the order the calendar grid is rendered.
 * @param {object} props - The label parameters.
 * @param {number} [props.weekStartsOn] - The weekday index (0 = Sunday) the week should start on. Default - 0.
 * @param {string} [props.locale] - The locale used to format labels. Default - undefined (runtime default).
 * @returns {Array<string>} Seven abbreviated weekday labels, starting from weekStartsOn.
 */
export function getWeekdayLabels({
	weekStartsOn = 0,
	locale,
}: { weekStartsOn?: number; locale?: string } = {}): Array<string> {
	const cacheKey = `${locale ?? ''}:${weekStartsOn}`;
	const cachedLabels = weekdayLabelsCache.get(cacheKey);
	if (cachedLabels) return cachedLabels;

	const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
	/** 2021-01-03 is a Sunday, used as a stable reference week. */
	const labels = Array.from({ length: 7 }, (_, index) =>
		formatter.format(new Date(2021, 0, 3 + ((weekStartsOn + index) % 7))),
	);

	weekdayLabelsCache.set(cacheKey, labels);
	return labels;
}

/**
 * @description Returns the localized full month names (January–December) for use in a month picker.
 * @param {object} [props] - The label parameters.
 * @param {string} [props.locale] - The locale used to format labels. Default - undefined (runtime default).
 * @returns {Array<string>} Twelve full month names, in calendar order.
 */
export function getMonthNames({ locale }: { locale?: string } = {}): Array<string> {
	const cacheKey = locale ?? '';
	const cachedNames = monthNamesCache.get(cacheKey);
	if (cachedNames) return cachedNames;

	const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
	const names = Array.from({ length: 12 }, (_, index) => formatter.format(new Date(2021, index, 1)));

	monthNamesCache.set(cacheKey, names);
	return names;
}

/**
 * @description Resolves the inclusive min/max years for the calendar year picker, defaulting to 0–9999 when bounds are omitted.
 * @param {object} [props] - The bound parameters.
 * @param {Date} [props.minDate] - The earliest selectable date.
 * @param {Date} [props.maxDate] - The latest selectable date.
 * @returns {{ minYear: number; maxYear: number }} The inclusive year range used by the virtualized year list.
 */
export function getCalendarYearBounds({
	minDate,
	maxDate,
}: {
	minDate?: Date;
	maxDate?: Date;
} = {}): { minYear: number; maxYear: number } {
	const minYear = minDate?.getFullYear() ?? 0;
	const maxYear = maxDate?.getFullYear() ?? 9999;
	return { minYear, maxYear: Math.max(minYear, maxYear) };
}

/**
 * @description Determines whether a candidate date falls outside the allowed min/max/disabled bounds.
 * @param {object} props - The bounds parameters.
 * @param {Date} props.date - The candidate date.
 * @param {number} [props.minTimestamp] - Precomputed earliest selectable midnight timestamp.
 * @param {number} [props.maxTimestamp] - Precomputed latest selectable end-of-day timestamp.
 * @param {(date: Date) => boolean} [props.disabled] - Predicate marking additional dates as disabled.
 * @returns {boolean} True when the date should be disabled.
 */
export function isDateDisabled({
	date,
	minTimestamp,
	maxTimestamp,
	disabled,
}: {
	date: Date;
	minTimestamp?: number;
	maxTimestamp?: number;
	disabled?: (date: Date) => boolean;
}): boolean {
	const dayTimestamp = getDayTimestamp(date);
	if (minTimestamp !== undefined && dayTimestamp < minTimestamp) return true;
	if (maxTimestamp !== undefined && dayTimestamp > maxTimestamp) return true;
	return disabled?.(date) ?? false;
}

/**
 * @description Precomputes inclusive min/max day-bound timestamps for repeated disabled checks within a render.
 * @param {object} [props] - The bound dates.
 * @param {Date} [props.minDate] - The earliest selectable date.
 * @param {Date} [props.maxDate] - The latest selectable date.
 * @returns {{ minTimestamp?: number; maxTimestamp?: number }} Normalized bound timestamps.
 */
export function getDateBoundTimestamps({
	minDate,
	maxDate,
}: {
	minDate?: Date;
	maxDate?: Date;
} = {}): { minTimestamp?: number; maxTimestamp?: number } {
	return {
		minTimestamp: minDate ? getDayTimestamp(minDate) : undefined,
		maxTimestamp: maxDate
			? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate(), 23, 59, 59, 999).getTime()
			: undefined,
	};
}

/**
 * @description Checks whether two view dates represent the same calendar month.
 * @param {Date} first - The first view date.
 * @param {Date} second - The second view date.
 * @returns {boolean} True when both share the same year and month.
 */
export function isSameMonth(first: Date, second: Date): boolean {
	return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
}

/**
 * @description Returns the first day of the month for a given date.
 * @param {Date} date - Any date within the target month.
 * @returns {Date} Midnight on the first day of that month.
 */
export function getMonthStart(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * @description Resolves the month to display from a selected value, falling back to the current month.
 * @param {Date | CalendarRangeValueType | undefined} value - The selected single date or range.
 * @returns {Date} The first day of the value's month, or today's month when empty.
 */
export function getViewMonthFromValue(value: Date | CalendarRangeValueType | undefined): Date {
	if (!value) return getMonthStart(new Date());
	if (value instanceof Date) return getMonthStart(value);
	return getMonthStart(value.to ?? value.from);
}
