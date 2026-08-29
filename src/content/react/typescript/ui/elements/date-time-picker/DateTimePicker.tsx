'use client';

import { ChangeEvent, JSX, useState } from 'react';
import { CalendarIcon } from 'lucide-react';

import { DateTimePickerPropsType } from './date-time-picker.type';
import { cn } from '../../utils/styles.util';
import { combineDateAndTime, formatDateTimeForDisplay, setTimeOnDate } from './date-time-picker.helper';

import { Calendar } from '../calendar';
import { Container } from '../container';
import { Input } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Text } from '../text';

/**
 * @description Popover-based control for selecting a date, or a date and time, that displays the selection in a field-style trigger.
 * @returns {JSX.Element} The DateTimePicker component.
 */
export function DateTimePicker({
	value,
	defaultValue,
	onValueChange,

	granularity = 'date',
	placeholder = 'Pick a date',
	name,
	disabled,
	state = 'default',

	minDate,
	maxDate,
	className,
	...props
}: DateTimePickerPropsType): JSX.Element {
	const [internalValue, setInternalValue] = useState<Date | undefined>(defaultValue);
	const [open, setOpen] = useState(false);

	const currentValue = value ?? internalValue;
	const displayValue = formatDateTimeForDisplay({ date: currentValue, granularity });

	/**
	 * @description Updates the selected value for controlled and uncontrolled usage.
	 * @param {Date | undefined} nextValue - The next selected date.
	 * @returns {void}
	 */
	const commitValue = (nextValue: Date | undefined): void => {
		onValueChange?.(nextValue);
		if (value === undefined) setInternalValue(nextValue);
	};

	/**
	 * @description Commits a calendar day selection and closes the popover for date-only granularity.
	 * @param {Date | { from: Date; to?: Date } | undefined} nextDay - The calendar selection payload.
	 * @returns {void}
	 */
	const handleDaySelect = (nextDay: Date | { from: Date; to?: Date } | undefined): void => {
		const selectedDay = nextDay instanceof Date ? nextDay : nextDay?.from;
		if (!selectedDay) return;

		commitValue(combineDateAndTime({ day: selectedDay, time: currentValue }));
		if (granularity === 'date') setOpen(false);
	};

	/**
	 * @description Builds a change handler that updates hours or minutes on the current date.
	 * @param {'hours' | 'minutes'} part - Which time part to update.
	 * @returns {(event: ChangeEvent<HTMLInputElement>) => void} The input change handler.
	 */
	const handleTimeChange =
		(part: 'hours' | 'minutes') =>
		(event: ChangeEvent<HTMLInputElement>): void => {
			const baseDate = currentValue ?? new Date();
			const numericValue = Number(event.target.value) || 0;

			commitValue(
				setTimeOnDate({
					date: baseDate,
					hours: part === 'hours' ? numericValue : baseDate.getHours(),
					minutes: part === 'minutes' ? numericValue : baseDate.getMinutes(),
				}),
			);
		};

	return (
		<Popover open={open} onOpenChange={setOpen} align="start" trapFocus={false}>
			{name && <input type="hidden" name={name} value={currentValue?.toISOString() ?? ''} readOnly />}

			<PopoverTrigger
				variant="outline"
				disabled={disabled}
				className={cn(
					'w-full justify-between gap-2 font-normal',
					!displayValue && 'text-muted-foreground',
					state === 'danger' && 'border-danger',
					state === 'success' && 'border-success',
					state === 'warn' && 'border-warn',
					className,
				)}
				data-slot="date-time-picker"
				aria-label={placeholder}
				{...props}
			>
				<Container as="span" className="truncate">
					{displayValue || placeholder}
				</Container>
				<CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			</PopoverTrigger>

			<PopoverContent className="w-auto p-3" data-slot="date-time-picker-content">
				<Calendar value={currentValue} onValueChange={handleDaySelect} minDate={minDate} maxDate={maxDate} />

				{granularity === 'datetime' && (
					<Container className="mt-3 flex items-center gap-2 border-t border-background-light pt-3">
						<Text as="body-small" variant="muted">
							Time
						</Text>
						<Input
							name={name ? `${name}-hours` : 'date-time-picker-hours'}
							type="number"
							min={0}
							max={23}
							value={currentValue?.getHours() ?? ''}
							onChange={handleTimeChange('hours')}
							inputSize="sm"
							className="w-16"
							aria-label="Hours"
						/>
						<Text as="body-small" variant="muted">
							:
						</Text>
						<Input
							name={name ? `${name}-minutes` : 'date-time-picker-minutes'}
							type="number"
							min={0}
							max={59}
							value={currentValue?.getMinutes() ?? ''}
							onChange={handleTimeChange('minutes')}
							inputSize="sm"
							className="w-16"
							aria-label="Minutes"
						/>
					</Container>
				)}
			</PopoverContent>
		</Popover>
	);
}
