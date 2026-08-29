/**
 * @description Formats a date for display in the picker's trigger input, including the time when granularity is "datetime".
 * @param {object} props - The format parameters.
 * @param {Date} [props.date] - The date to format.
 * @param {'date' | 'datetime'} props.granularity - Whether to include the time.
 * @returns {string} The formatted display string, or an empty string when no date is provided.
 */
export function formatDateTimeForDisplay({
	date,
	granularity,
}: {
	date?: Date;
	granularity: 'date' | 'datetime';
}): string {
	if (!date) return '';

	const dateLabel = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
	if (granularity === 'date') return dateLabel;

	const timeLabel = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date);
	return `${dateLabel}, ${timeLabel}`;
}

/**
 * @description Returns a new date combining a calendar day with the hours/minutes of a reference time.
 * @param {object} props - The combine parameters.
 * @param {Date} props.day - The date providing the year, month, and day.
 * @param {Date} [props.time] - The date providing hours and minutes. Defaults to midnight when omitted.
 * @returns {Date} The combined date.
 */
export function combineDateAndTime({ day, time }: { day: Date; time?: Date }): Date {
	const combined = new Date(day);
	combined.setHours(time?.getHours() ?? 0, time?.getMinutes() ?? 0, 0, 0);
	return combined;
}

/**
 * @description Returns a new date with its hours and minutes replaced.
 * @param {object} props - The set-time parameters.
 * @param {Date} props.date - The base date.
 * @param {number} props.hours - The hours to set.
 * @param {number} props.minutes - The minutes to set.
 * @returns {Date} The updated date.
 */
export function setTimeOnDate({ date, hours, minutes }: { date: Date; hours: number; minutes: number }): Date {
	const updated = new Date(date);
	updated.setHours(hours, minutes, 0, 0);
	return updated;
}
