'use client';

import {
	ChangeEvent,
	JSX,
	FocusEvent as ReactFocusEvent,
	KeyboardEvent as ReactKeyboardEvent,
	RefObject,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react';

import { AutoCompleteContentPropsType, AutoCompletePropsType } from './auto-complete.type';
import { getNextNavigationIndex, KeyboardNavigationDirectionType } from '../../utils/keyboard.util';
import { cn } from '../../utils/styles.util';

import { usePopoverContext } from '../popover/usePopover.hook';

import { Button } from '../button';
import { Container } from '../container';
import { Input } from '../input';
import { Popover, PopoverContent } from '../popover';

/**
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
 * @description Text input that suggests and lets users pick from a filtered list of options as they type.
 * @returns {JSX.Element} The AutoComplete component.
 */
export function AutoComplete({
	options = [],
	value,
	defaultValue,
	onChange,
	onValueChange,
	onFocus,
	onBlur,
	onKeyDown,

	rootContainerProps,
	dropdownContentProps,
	dropdownItemProps,
	...props
}: AutoCompletePropsType): JSX.Element {
	/** Internal open state when the open prop is not provided. */
	const [isFocused, setIsFocused] = useState(false);
	/** Internal value state when the value prop is not provided. */
	const [internalValue, setInternalValue] = useState(defaultValue ?? '');
	/** Index of the currently highlighted option for keyboard navigation (-1 means none). */
	const [activeIndex, setActiveIndex] = useState(-1);

	/** Stable id base used to build option ids for aria-activedescendant. */
	const baseId = useId();

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

	/**
	 * Update the value, notifying controlled consumers.
	 * @param {string} newValue - The next input value.
	 */
	const handleValueChange = (newValue: string): void => {
		onValueChange?.(newValue);
		if (value === undefined) setInternalValue(newValue);
	};

	/**
	 * Commit an option selection and close the dropdown.
	 * @param {string} option - The selected option.
	 */
	const handleOptionSelect = (option: string): void => {
		handleValueChange(option);
		setIsFocused(false);
		setActiveIndex(-1);
	};

	/**
	 * Forward the consumer change handler, update the value, and reopen the dropdown as the user types.
	 * @param {ChangeEvent<HTMLInputElement>} event - The input change event.
	 */
	const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
		onChange?.(event);
		handleValueChange(event.target.value);
		setActiveIndex(-1);
		setIsFocused(true);
	};

	/**
	 * Forward the consumer focus handler and open the dropdown.
	 * @param {ReactFocusEvent<HTMLInputElement>} event - The focus event.
	 */
	const handleInputFocus = (event: ReactFocusEvent<HTMLInputElement>): void => {
		onFocus?.(event);
		setIsFocused(true);
	};

	/**
	 * Forward the consumer blur handler, then close only when focus left both the input and the popover.
	 * @param {ReactFocusEvent<HTMLInputElement>} event - The blur event.
	 */
	const handleInputBlur = (event: ReactFocusEvent<HTMLInputElement>): void => {
		onBlur?.(event);
		if (blurTimeoutRef.current !== null) clearTimeout(blurTimeoutRef.current);

		blurTimeoutRef.current = setTimeout(() => {
			blurTimeoutRef.current = null;

			/** Keep dropdown open if focus moved into the popover content. */
			if (document.activeElement?.closest('[data-slot="popover-content"]')) return;
			setIsFocused(false);
			setActiveIndex(-1);
		}, 0);
	};

	/**
	 * Forward the consumer key handler, then handle listbox navigation and selection.
	 * @param {ReactKeyboardEvent<HTMLInputElement>} event - The keyboard event.
	 */
	const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
		onKeyDown?.(event);

		const optionCount = filteredOptions.length;

		if (event.key === 'Escape') {
			event.preventDefault();
			setIsFocused(false);
			setActiveIndex(-1);
			return;
		}

		if (optionCount === 0) return;

		/** Map navigation keys to a direction for the shared index helper. */
		const directionByKey: Record<string, KeyboardNavigationDirectionType> = {
			ArrowDown: 'next',
			ArrowUp: 'previous',
			Home: 'first',
			End: 'last',
		};
		const direction = directionByKey[event.key];

		if (direction) {
			event.preventDefault();
			setActiveIndex((previousIndex) =>
				getNextNavigationIndex({ direction, currentIndex: previousIndex, itemCount: optionCount }),
			);
			return;
		}

		if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < optionCount) {
			event.preventDefault();
			handleOptionSelect(filteredOptions[activeIndex]);
		}
	};

	/** Keep the highlighted option scrolled into view during keyboard navigation. */
	useEffect(() => {
		if (activeIndex < 0) return;
		document.getElementById(`${baseId}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
	}, [activeIndex, baseId]);

	/** Clear pending blur timeout on unmount. */
	useEffect(() => {
		return (): void => {
			if (blurTimeoutRef.current !== null) clearTimeout(blurTimeoutRef.current);
		};
	}, []);

	return (
		<Popover
			{...rootContainerProps}
			open={currentOpen}
			onOpenChange={(isOpen): void => {
				if (isOpen) return;
				setIsFocused(false);
				setActiveIndex(-1);
			}}
			trapFocus={false}
			data-slot="auto-complete"
		>
			{/* Registers the input wrapper span as the popover's trigger anchor for positioning. */}
			<TriggerAnchorRegistrar anchorRef={anchorRef} />

			<Container ref={anchorRef} as="span">
				<Input
					{...props}
					value={currentValue}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					onBlur={handleInputBlur}
					onKeyDown={handleInputKeyDown}
					type="text"
					role="combobox"
					aria-autocomplete="list"
					aria-expanded={currentOpen}
					aria-activedescendant={activeIndex >= 0 ? `${baseId}-option-${activeIndex}` : undefined}
				/>
			</Container>

			<AutoCompleteContent
				options={filteredOptions}
				onOptionSelect={handleOptionSelect}
				activeIndex={activeIndex}
				baseId={baseId}
				dropdownItemProps={dropdownItemProps}
				{...dropdownContentProps}
			/>
		</Popover>
	);
}

/**
 * @description Internal dropdown content that renders each filtered option as a button-like listbox option wired to update the parent autocomplete value.
 * @returns {JSX.Element} The AutoCompleteContent component.
 */
function AutoCompleteContent({
	options,
	onOptionSelect,
	activeIndex,
	baseId,

	dropdownItemProps,
	...dropdownContentProps
}: AutoCompleteContentPropsType): JSX.Element {
	return (
		<PopoverContent
			{...dropdownContentProps}
			className={cn('flex max-h-60 flex-col overflow-auto p-1', dropdownContentProps.className)}
			role="listbox"
		>
			{options.map((option, index) => (
				<Button
					key={index}
					variant="ghost"
					size="sm"
					{...dropdownItemProps}
					id={`${baseId}-option-${index}`}
					/* Prevent the click from blurring the input so focus stays on the combobox. */
					onMouseDown={(event): void => event.preventDefault()}
					onClick={(): void => onOptionSelect(option)}
					className={cn('justify-start', dropdownItemProps?.className)}
					data-slot="auto-complete-item"
					data-state={index === activeIndex ? 'on' : undefined}
					role="option"
					aria-selected={index === activeIndex}
					tabIndex={-1}
				>
					{option}
				</Button>
			))}
		</PopoverContent>
	);
}
