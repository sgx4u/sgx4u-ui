'use client';

import { JSX, RefObject, useEffect, useMemo, useRef, useState } from 'react';

import { AutoCompleteContentPropsType, AutoCompletePropsType } from './auto-complete.type';
import { cn } from '../../utils/styles.util';

import { usePopoverContext } from '../popover/usePopover.hook';

import { Button } from '../button';
import { Container } from '../container';
import { Input } from '../input';
import { Popover, PopoverContent } from '../popover';

/**
 * @name TriggerAnchorRegistrar
 * @description Registers an arbitrary DOM element as the Popover's trigger anchor so that
 * PopoverContent can compute its position relative to that element. Must be rendered as a
 * child of the target Popover Provider.
 * @returns {JSX.Element} An empty fragment (renders nothing to the DOM).
 */
function TriggerAnchorRegistrar({ anchorRef }: { anchorRef: RefObject<HTMLDivElement | null> }): JSX.Element {
	const { registerTriggerRef, defaultPopoverId } = usePopoverContext();

	useEffect(() => {
		registerTriggerRef(defaultPopoverId, anchorRef.current);
		return (): void => {
			registerTriggerRef(defaultPopoverId, null);
		};
	}, [registerTriggerRef, defaultPopoverId, anchorRef]);

	return <></>;
}

/**
 * @name Auto Complete
 * @description Text input that suggests and lets users pick from a filtered list of options as they type.
 * @returns {JSX.Element} The AutoComplete component.
 */
export function AutoComplete({
	options = [],
	value,
	defaultValue,
	onChange,
	onValueChange,

	rootContainerProps,
	dropdownContentProps,
	dropdownItemProps,
	...props
}: AutoCompletePropsType): JSX.Element {
	/** Internal open state when the open prop is not provided. */
	const [isFocused, setIsFocused] = useState(false);
	/** Internal value state when the value prop is not provided. */
	const [internalValue, setInternalValue] = useState(defaultValue ?? '');

	/** Ref for the span that wraps the Input — used as the popover anchor. */
	const anchorRef = useRef<HTMLDivElement | null>(null);

	/** Pending blur timeout; cancelled when focus moves into the popover so the dropdown stays open. */
	const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	/** Controlled + Uncontrolled sync. */
	const currentValue = value ?? internalValue;

	/** Filtered options based on the current value. */
	const filteredOptions = useMemo(() => {
		if (!currentValue) return options;
		return options.filter((option) => option.toLowerCase().includes(currentValue.toString().toLowerCase()));
	}, [currentValue, options]);

	const currentOpen = isFocused && filteredOptions.length > 0;

	const handleValueChange = (newValue: string): void => {
		onValueChange?.(newValue);
		if (value === undefined) setInternalValue(newValue);
	};

	const handleOptionSelect = (option: string): void => {
		handleValueChange(option);
		setIsFocused(false);
	};

	/** Close only when focus actually left both the input and the popover (e.g. Tab out or click outside). */
	const handleInputBlur = (): void => {
		if (blurTimeoutRef.current !== null) clearTimeout(blurTimeoutRef.current);
		blurTimeoutRef.current = setTimeout(() => {
			blurTimeoutRef.current = null;
			const activeElement = document.activeElement;
			/** Keep dropdown open if focus moved into the popover content (focus trap). */
			if (activeElement?.closest('[data-slot="PopoverContent"]') ?? false) return;
			setIsFocused(false);
		}, 0);
	};

	/** Clear pending blur timeout when the dropdown opens or on unmount. */
	useEffect(() => {
		return (): void => {
			if (blurTimeoutRef.current !== null) clearTimeout(blurTimeoutRef.current);
		};
	}, []);

	return (
		<Popover
			open={currentOpen}
			onOpenChange={(isOpen): void => {
				if (!isOpen) setIsFocused(false);
			}}
			data-slot="auto-complete"
			{...rootContainerProps}
		>
			{/* Registers the input wrapper span as the popover's trigger anchor for positioning. */}
			<TriggerAnchorRegistrar anchorRef={anchorRef} />

			<Container ref={anchorRef} as="span">
				<Input
					value={currentValue}
					onChange={(event): void => {
						onChange?.(event);
						handleValueChange(event.target.value);
					}}
					onFocus={(): void => setIsFocused(true)}
					onBlur={handleInputBlur}
					type="text"
					role="combobox"
					aria-autocomplete="list"
					aria-expanded={currentOpen}
					{...props}
				/>
			</Container>

			<AutoCompleteContent
				options={filteredOptions}
				onOptionSelect={handleOptionSelect}
				dropdownItemProps={dropdownItemProps}
				{...dropdownContentProps}
			/>
		</Popover>
	);
}

/**
 * @name Auto Complete Content
 * @description Internal dropdown content that renders each filtered option as a button-like listbox option wired to update the parent autocomplete value.
 * @returns {JSX.Element} The AutoCompleteContent component.
 */
function AutoCompleteContent({
	options,
	onOptionSelect,

	dropdownItemProps,
	...dropdownContentProps
}: AutoCompleteContentPropsType): JSX.Element {
	return (
		<PopoverContent
			className={cn('flex max-h-60 flex-col overflow-auto p-1')}
			role="listbox"
			{...dropdownContentProps}
		>
			{options.map((option, index) => (
				<Button
					key={index}
					onClick={(): void => onOptionSelect(option)}
					variant="ghost"
					size="xs"
					className="justify-start"
					role="option"
					{...dropdownItemProps}
				>
					{option}
				</Button>
			))}
		</PopoverContent>
	);
}
