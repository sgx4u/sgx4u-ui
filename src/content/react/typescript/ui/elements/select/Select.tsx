'use client';

import {
	createContext,
	Fragment,
	JSX,
	KeyboardEvent as ReactKeyboardEvent,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';

import {
	SelectContentPropsType,
	SelectContextType,
	SelectItemPropsType,
	SelectPropsType,
	SelectTriggerPropsType,
} from './select.type';
import { cn } from '../../utils/styles.util';
import { selectItemOnKeyDownHelper } from './select-keydown.helper';

import { Button } from '../button';
import { Container } from '../container';
import { Popover, PopoverContent, PopoverTrigger, usePopoverContext } from '../popover';
import { Separator } from '../separator';

/** Select context. */
const SelectContext = createContext<SelectContextType>({
	value: [],
	onValueChange: () => {},
	open: false,
	onOpenChange: () => {},
	selectedChildren: [],
	setSelectedChildren: () => {},
	type: 'single',
	openedViaKeyboard: { current: false },
});

/**
 * @name Select
 * @description A dropdown control for choosing one or more options from a list, with an optional searchable variant.
 * @returns {JSX.Element} The Select component.
 */
export function Select({
	value,
	defaultValue,
	onValueChange,
	open,
	onOpenChange,
	type = 'single',

	children,

	...props
}: SelectPropsType): JSX.Element {
	/** Internal open state when open is not provided. */
	const [internalOpen, setInternalOpen] = useState(false);
	/** Internal selected value state when value is not provided. */
	const [internalValue, setInternalValue] = useState<Array<string>>(value ?? defaultValue ?? []);

	/** Selected children state. */
	const [selectedChildren, setSelectedChildren] = useState<SelectContextType['selectedChildren']>([]);

	/** Controlled + Uncontrolled sync. */
	const currentValue = value ?? internalValue;
	const currentOpen = open ?? internalOpen;

	/** Track if select was opened via keyboard. */
	const openedViaKeyboardRef = useRef(false);

	const handleValueChange = (newValue: Array<string>): void => {
		onValueChange?.(newValue);
		if (value === undefined) setInternalValue(newValue);
	};

	const handleOpenChange = (newOpen: boolean): void => {
		onOpenChange?.(newOpen);
		if (open === undefined) setInternalOpen(newOpen);
		if (!newOpen) openedViaKeyboardRef.current = false;
	};

	return (
		<SelectContext.Provider
			value={{
				open: currentOpen,
				onOpenChange: handleOpenChange,
				value: currentValue,
				onValueChange: handleValueChange,
				selectedChildren,
				setSelectedChildren,
				type,
				openedViaKeyboard: openedViaKeyboardRef,
			}}
		>
			<Popover open={currentOpen} onOpenChange={handleOpenChange} sideOffset={4} data-slot="select" {...props}>
				{children}
			</Popover>
		</SelectContext.Provider>
	);
}

/**
 * @name Select Trigger
 * @description Button trigger that renders the current selection as inline chips with separators and exposes listbox-related ARIA attributes.
 * @returns {JSX.Element} The SelectTrigger component.
 */
export function SelectTrigger({ onKeyDown, className, children, ...props }: SelectTriggerPropsType): JSX.Element {
	const { open, selectedChildren, openedViaKeyboard: openedViaKeyboardRef } = useContext(SelectContext);

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		if (event.key === 'Enter' || event.key === ' ') openedViaKeyboardRef.current = true;
		onKeyDown?.(event);
	};

	return (
		<PopoverTrigger
			onKeyDown={handleKeyDown}
			variant="outline"
			className={cn('flex items-center justify-between gap-1', className)}
			data-slot="select-trigger"
			aria-haspopup="listbox"
			{...props}
		>
			{selectedChildren.length > 0 ? (
				<Container className="flex items-center gap-2 overflow-hidden">
					{selectedChildren.map((child, index) => (
						<Fragment key={index}>
							{child.element}
							<Separator
								orientation="vertical"
								className={cn('h-5', index === selectedChildren.length - 1 && 'hidden')}
							/>
						</Fragment>
					))}
				</Container>
			) : (
				children
			)}

			<ChevronDownIcon className={cn('ml-3 size-4 transition-all', open && 'rotate-180')} />
		</PopoverTrigger>
	);
}

/**
 * @name Select Content
 * @description Popover content wrapper that lays out select options in a scrollable column.
 * @returns {JSX.Element} The SelectContent component.
 */
export function SelectContent({ className, ...props }: SelectContentPropsType): JSX.Element {
	const { open, value: selectedValue, openedViaKeyboard } = useContext(SelectContext);
	const { defaultPopoverId } = usePopoverContext();

	/** Auto-focus first or selected item when select opens via keyboard. */
	useEffect(() => {
		if (!open || !openedViaKeyboard.current) return;

		const timeoutId = setTimeout(() => {
			const selectContainer = document.getElementById(`popover-${defaultPopoverId}`);
			if (!selectContainer) return;

			const selectItems = Array.from(
				selectContainer.querySelectorAll<HTMLButtonElement>('[data-slot="select-item"]'),
			).filter((item) => !item.disabled && !item.hasAttribute('aria-hidden'));

			if (selectItems.length === 0) return;

			if (selectedValue.length > 0) {
				const selectedItem = selectItems.find((item) =>
					selectedValue.includes(item.getAttribute('data-value') ?? ''),
				);
				if (selectedItem) {
					selectedItem.focus();
					return;
				}
			}

			selectItems[0]?.focus();
		}, 50);

		return (): void => clearTimeout(timeoutId);
	}, [open, selectedValue, openedViaKeyboard, defaultPopoverId]);

	return (
		<PopoverContent
			className={cn('flex flex-col p-1', className)}
			data-slot="select-content"
			role="listbox"
			{...props}
		/>
	);
}

/**
 * @name Select Item
 * @description Interactive option that toggles its value within the current selection array and visually marks selected items with a check icon.
 * @returns {JSX.Element} The SelectItem component.
 */
export function SelectItem({ value, onKeyDown, className, children, ...props }: SelectItemPropsType): JSX.Element {
	const { onOpenChange, onValueChange, value: selectedValue, setSelectedChildren, type } = useContext(SelectContext);

	const handleSelect = (): void => {
		if (type === 'single') {
			onValueChange([value]);
			onOpenChange(false);
			setSelectedChildren([{ id: value, element: children }]);
			return;
		}

		const newSelectedValue = selectedValue.includes(value)
			? selectedValue.filter((existingValue) => existingValue !== value)
			: [...selectedValue, value];

		onValueChange(newSelectedValue);
		onOpenChange(false);

		if (selectedValue.includes(value)) {
			setSelectedChildren((prev) => prev.filter((child) => child.id !== value));
		} else {
			setSelectedChildren((prev) => [...prev, { id: value, element: children }]);
		}
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		selectItemOnKeyDownHelper(event);
		onKeyDown?.(event);
	};

	return (
		<Button
			onClick={handleSelect}
			onKeyDown={handleKeyDown}
			variant="ghost"
			size="xs"
			className={cn(
				'relative justify-start pr-12 pl-2 font-normal',
				selectedValue.includes(value) && 'font-medium',
				className,
			)}
			data-slot="select-item"
			data-value={value}
			role="option"
			aria-selected={selectedValue.includes(value)}
			{...props}
		>
			{children}

			{selectedValue.includes(value) && <CheckIcon className="absolute inset-[0_5px_0_auto] my-auto size-4" />}
		</Button>
	);
}
