'use client';

import { JSX, MouseEvent, useState } from 'react';

import { CalendarPropsType, CalendarRangeValueType } from './calendar.type';
import { cn } from '../../utils/styles.util';
import {
	getCalendarMonthMatrix,
	getCalendarYearBounds,
	getDateBoundTimestamps,
	getDayKey,
	getMonthNames,
	getViewMonthFromValue,
	getWeekdayLabels,
	isDateDisabled,
	isSameDay,
	isSameMonth,
	isWithinRange,
} from './calendar.helper';

import { Button } from '../button';
import { Container } from '../container';
import { Icons } from '../icons';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../select';
import { Text } from '../text';
import { Virtualizer } from '../virtualizer';

/** Fixed row height matching SelectItem size="sm" (h-7). */
const CALENDAR_YEAR_ITEM_HEIGHT = 28;

/**
 * @description Month-grid date picker supporting single-date or date-range selection, with keyboard-free pointer navigation and configurable min/max/disabled bounds.
 * @returns {JSX.Element} The Calendar component with month and year selectors.
 */
export function Calendar({
	mode = 'single',
	value,
	defaultValue,
	onValueChange,

	onMonthChange,
	onYearChange,

	minDate,
	maxDate,
	disabled,

	weekStartsOn = 0,
	locale,
	className,
	...props
}: CalendarPropsType): JSX.Element {
	const [internalValue, setInternalValue] = useState<Date | CalendarRangeValueType | undefined>(defaultValue);
	const currentValue = value ?? internalValue;

	const [viewMonth, setViewMonth] = useState<Date>(() => getViewMonthFromValue(value ?? defaultValue));
	const [syncedValueMonthKey, setSyncedValueMonthKey] = useState<string>(() => {
		const initialMonth = getViewMonthFromValue(value ?? defaultValue);
		return `${initialMonth.getFullYear()}-${initialMonth.getMonth()}`;
	});

	/** Keep the displayed month in sync when the selected value's month changes. */
	const valueMonth = getViewMonthFromValue(currentValue);
	const valueMonthKey = currentValue ? `${valueMonth.getFullYear()}-${valueMonth.getMonth()}` : '';
	if (valueMonthKey !== '' && valueMonthKey !== syncedValueMonthKey) {
		setSyncedValueMonthKey(valueMonthKey);
		if (!isSameMonth(valueMonth, viewMonth)) setViewMonth(valueMonth);
	}

	const currentMonth = viewMonth;

	/**
	 * @description Updates the displayed month via previous/next and notifies month (and year when it crosses).
	 * @param {Date} nextMonth - The next month to display.
	 * @returns {void}
	 */
	const handleMonthNavigate = (nextMonth: Date): void => {
		if (isSameMonth(nextMonth, currentMonth)) return;

		const previousYear = currentMonth.getFullYear();
		setViewMonth(nextMonth);
		onMonthChange?.(nextMonth);
		if (nextMonth.getFullYear() !== previousYear) onYearChange?.(nextMonth.getFullYear());
	};

	const commitValue = (nextValue: Date | CalendarRangeValueType | undefined): void => {
		onValueChange?.(nextValue);
		if (value === undefined) setInternalValue(nextValue);
	};

	const handleDayClick = (date: Date): void => {
		if (mode === 'single') {
			commitValue(date);
		} else {
			const rangeValue = currentValue as CalendarRangeValueType | undefined;
			/** Start a new range, or complete the current one if only "from" is set. */
			if (!rangeValue?.from || rangeValue.to) commitValue({ from: date });
			else
				commitValue(
					date < rangeValue.from ? { from: date, to: rangeValue.from } : { from: rangeValue.from, to: date },
				);
		}

		const nextMonth = getViewMonthFromValue(date);
		setSyncedValueMonthKey(`${nextMonth.getFullYear()}-${nextMonth.getMonth()}`);
		if (!isSameMonth(nextMonth, currentMonth)) setViewMonth(nextMonth);
	};

	/**
	 * @description Handles day selection via event delegation on the month grid to avoid per-cell click closures.
	 * @param {MouseEvent<HTMLDivElement>} event - The grid click event.
	 * @returns {void}
	 */
	const handleDayGridClick = (event: MouseEvent<HTMLDivElement>): void => {
		const dayButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-slot="calendar-day"]');
		if (!dayButton || dayButton.disabled) return;

		const dayTimestamp = Number(dayButton.dataset.dayTimestamp);
		if (Number.isNaN(dayTimestamp)) return;
		handleDayClick(new Date(dayTimestamp));
	};

	const isDaySelected = (date: Date): boolean => {
		if (!currentValue) return false;
		if (mode === 'single') return isSameDay(currentValue as Date, date);

		const rangeValue = currentValue as CalendarRangeValueType;
		if (!rangeValue.from) return false;
		if (!rangeValue.to) return isSameDay(rangeValue.from, date);
		return isWithinRange({ date, start: rangeValue.from, end: rangeValue.to });
	};

	const weekdayLabels = getWeekdayLabels({ weekStartsOn, locale });
	const days = getCalendarMonthMatrix({ month: currentMonth, weekStartsOn });
	const monthNames = getMonthNames({ locale });

	const { minYear, maxYear } = getCalendarYearBounds({ minDate, maxDate });
	const { minTimestamp, maxTimestamp } = getDateBoundTimestamps({ minDate, maxDate });

	const yearCount = maxYear - minYear + 1;
	const currentYear = currentMonth.getFullYear();
	const currentMonthIndex = currentMonth.getMonth();

	const yearScrollIndex = Math.min(Math.max(currentYear - minYear, 0), yearCount - 1);
	const todayKey = getDayKey(new Date());

	const handleMonthSelect = (selectedValue: Array<string>): void => {
		const monthIndex = Number(selectedValue[0]);
		const nextMonth = new Date(currentYear, monthIndex, 1);
		if (isSameMonth(nextMonth, currentMonth)) return;

		setViewMonth(nextMonth);
		onMonthChange?.(nextMonth);
	};

	const handleYearSelect = (selectedValue: Array<string>): void => {
		const year = Number(selectedValue[0]);
		if (year === currentYear) return;

		setViewMonth(new Date(year, currentMonthIndex, 1));
		onYearChange?.(year);
	};

	return (
		<Container className={cn('w-fit', className)} data-slot="calendar" {...props}>
			<Container className="flex items-center justify-between gap-1 px-1 pb-3">
				<Button
					variant="outline"
					size="icon-sm"
					onClick={() => handleMonthNavigate(new Date(currentYear, currentMonthIndex - 1, 1))}
					aria-label="Previous month"
				>
					<Icons variant="arrow" arrowStyle="chevron" direction="left" />
				</Button>

				<Container className="flex items-center gap-1">
					<Select value={[String(currentMonthIndex)]} onValueChange={handleMonthSelect}>
						<SelectTrigger
							variant="ghost"
							size="sm"
							arrowClassName="size-3.5"
							className="h-8 w-32 gap-1 px-2 font-semibold"
							aria-label="Select month"
						/>
						<SelectContent>
							{monthNames.map((monthName, monthIndex) => (
								<SelectItem key={monthName} value={String(monthIndex)}>
									{monthName}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={[String(currentYear)]} onValueChange={handleYearSelect}>
						<SelectTrigger
							variant="ghost"
							size="sm"
							arrowClassName="size-3.5"
							className="h-8 w-20 gap-1 px-2 font-semibold"
							aria-label="Select year"
						>
							{currentYear}
						</SelectTrigger>
						<SelectContent className="overflow-hidden py-1 ps-1 pe-0">
							<Virtualizer
								count={yearCount}
								itemSize={CALENDAR_YEAR_ITEM_HEIGHT}
								scrollToIndex={yearScrollIndex}
							>
								{({ virtualItems, totalSize, viewportRef, onScroll }) => (
									<Container
										ref={viewportRef}
										onScroll={onScroll}
										className="h-72 w-full overflow-y-auto"
									>
										<Container className="relative" style={{ height: totalSize }}>
											{virtualItems.map(({ index, start, size }) => {
												const year = minYear + index;
												return (
													<SelectItem
														key={index}
														value={String(year)}
														className="absolute inset-x-0 w-full"
														style={{ top: start, height: size }}
													>
														{year}
													</SelectItem>
												);
											})}
										</Container>
									</Container>
								)}
							</Virtualizer>
						</SelectContent>
					</Select>
				</Container>

				<Button
					variant="outline"
					size="icon-sm"
					onClick={() => handleMonthNavigate(new Date(currentYear, currentMonthIndex + 1, 1))}
					aria-label="Next month"
				>
					<Icons variant="arrow" arrowStyle="chevron" direction="right" />
				</Button>
			</Container>

			<Container className="grid grid-cols-7 gap-1" role="grid" onClick={handleDayGridClick}>
				{weekdayLabels.map((label) => (
					<Text
						key={label}
						as="span"
						variant="muted"
						className="flex h-8 items-center justify-center text-xs font-medium"
					>
						{label}
					</Text>
				))}

				{days.map(({ date, dayKey, dayTimestamp, isCurrentMonth }) => {
					const isDisabled = isDateDisabled({ date, minTimestamp, maxTimestamp, disabled });
					const isSelected = isDaySelected(date);
					const isToday = dayKey === todayKey;

					return (
						<Button
							key={dayKey}
							variant={isSelected ? 'primary' : 'ghost'}
							size="icon-sm"
							disabled={isDisabled}
							className={cn(
								'text-sm',
								!isCurrentMonth && 'text-muted-foreground/40',
								isToday && !isSelected && 'font-semibold text-primary',
							)}
							data-slot="calendar-day"
							data-day-timestamp={dayTimestamp}
							aria-selected={isSelected}
							aria-current={isToday ? 'date' : undefined}
						>
							{date.getDate()}
						</Button>
					);
				})}
			</Container>
		</Container>
	);
}
