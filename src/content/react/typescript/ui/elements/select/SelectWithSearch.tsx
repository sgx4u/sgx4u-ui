'use client';

import {
	createContext,
	Fragment,
	JSX,
	MouseEvent as ReactMouseEvent,
	ReactNode,
	useContext,
	useMemo,
	useState,
} from 'react';
import { CheckIcon, ChevronDownIcon, PlusIcon, SearchIcon } from 'lucide-react';

import {
	SelectContentPropsType,
	SelectItemPropsType,
	SelectSearchPropsType,
	SelectTriggerPropsType,
	SelectWithSearchContextType,
	SelectWithSearchPropsType,
	SelectWithSearchSelectedChildType,
} from './select.type';
import { cn } from '../../utils/styles.util';

import { Button } from '../button';
import { Container } from '../container';
import { Input } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Separator } from '../separator';
import { Text } from '../text';

/** Select with search context. */
const SelectContext = createContext<SelectWithSearchContextType>({
	open: false,
	onOpenChange: () => {},
	value: [],
	onValueChange: () => {},
	selectedChildren: [],
	setSelectedChildren: () => {},
	type: 'single',
	searchTerm: '',
	setSearchTerm: () => {},
	onAddSelectItem: () => {},
});

/**
 * @description Searchable select control that supports single or multi-value selection, controlled/uncontrolled state, and dynamic item creation via an optional "add item" action.
 * @returns {JSX.Element} The SelectWithSearch component.
 */
export function SelectWithSearch({
	value,
	defaultValue,
	onValueChange,
	open,
	onOpenChange,
	type = 'single',
	onAddSelectItem,

	children,

	...props
}: SelectWithSearchPropsType): JSX.Element {
	/** Internal open state when open is not provided. */
	const [internalOpen, setInternalOpen] = useState(false);
	/** Internal selected value state when value is not provided. */
	const [internalValue, setInternalValue] = useState<Array<string>>(value ?? defaultValue ?? []);

	const [selectedChildren, setSelectedChildren] = useState<Array<SelectWithSearchSelectedChildType>>([]);
	const [searchTerm, setSearchTerm] = useState('');

	/** Controlled + Uncontrolled sync. */
	const currentValue = value ?? internalValue;
	const currentOpen = open ?? internalOpen;

	const handleValueChange = (newValue: Array<string>): void => {
		onValueChange?.(newValue);
		if (value === undefined) setInternalValue(newValue);
	};

	const handleOpenChange = (newOpen: boolean): void => {
		onOpenChange?.(newOpen);
		if (open === undefined) setInternalOpen(newOpen);
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
				searchTerm,
				setSearchTerm,
				onAddSelectItem,
			}}
		>
			<Popover open={currentOpen} onOpenChange={handleOpenChange} data-slot="select" {...props}>
				{children}
			</Popover>
		</SelectContext.Provider>
	);
}

/**
 * @description Button-like trigger that displays the current selection as labeled chips with separators and exposes a combobox pattern with ARIA wiring.
 * @returns {JSX.Element} The SelectWithSearchTrigger component.
 */
export function SelectWithSearchTrigger({ className, children, ...props }: SelectTriggerPropsType): JSX.Element {
	const { open, selectedChildren } = useContext(SelectContext);

	return (
		<PopoverTrigger
			variant="outline"
			{...props}
			className={cn('flex items-center justify-between gap-1', className)}
			data-slot="select-trigger"
			role="combobox"
			aria-expanded={open}
			aria-haspopup="listbox"
		>
			{selectedChildren.length > 0 ? (
				<Container className="flex items-center gap-2 overflow-hidden">
					{selectedChildren.map((child, index) => (
						<Fragment key={child.id}>
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

			<ChevronDownIcon
				className={cn('ml-3 size-4 transition-transform', open && 'rotate-180')}
				aria-hidden="true"
			/>
		</PopoverTrigger>
	);
}

/**
 * @description Popover content that filters `SelectWithSearchItem` children by the shared search term while preserving non-item elements such as headers or the search field.
 * @returns {JSX.Element} The SelectWithSearchContent component.
 */
export function SelectWithSearchContent({ className, children, ...props }: SelectContentPropsType): JSX.Element {
	const { searchTerm, onAddSelectItem, type } = useContext(SelectContext);

	/** Normalize children to a flat array */
	const childArray = useMemo(() => {
		return (Array.isArray(children) ? children : [children]).flat();
	}, [children]);

	const term = (searchTerm ?? '').toString().trim().toLowerCase();

	/** Build final children: keep non-items, include items only when they match the search. */
	const { searchInput, filteredChildren, hasItemMatch } = useMemo(() => {
		const checkIsItem = (child: JSX.Element): boolean => {
			if (!child) return false;
			if (child?.props?.['data-slot'] === 'select-item') return true;
			return child?.type === SelectWithSearchItem;
		};

		return childArray.reduce<{
			searchInput: ReactNode;
			filteredChildren: Array<ReactNode>;
			hasItemMatch: boolean;
		}>(
			(accumulator, child) => {
				if (!checkIsItem(child)) {
					if (child?.type === SelectSearch) {
						accumulator.searchInput = child;
						return accumulator;
					}
					accumulator.filteredChildren.push(child);
					return accumulator;
				}

				if (!term) {
					accumulator.hasItemMatch = true;
					accumulator.filteredChildren.push(child);
					return accumulator;
				}

				const text =
					(typeof child?.props?.children === 'string' && child.props.children) ||
					(child?.props?.children && String(child.props.children)) ||
					(child?.props?.['data-label'] ?? '') ||
					'';

				if (String(text).toLowerCase().includes(term)) {
					accumulator.hasItemMatch = true;
					accumulator.filteredChildren.push(child);
				}

				return accumulator;
			},
			{
				searchInput: null,
				filteredChildren: [],
				hasItemMatch: false,
			},
		);
	}, [childArray, term]);

	const noMatchBlock =
		!hasItemMatch && term ? (
			<Container className="space-y-2 p-2" role="status" aria-live="polite">
				<Text as="body-small" className="text-center text-muted-foreground">
					No match found!
				</Text>

				{onAddSelectItem && (
					<Button variant="muted-light" size="sm" className="w-full" onClick={() => onAddSelectItem(term)}>
						<PlusIcon />
						Add &quot;{term}&quot;
					</Button>
				)}
			</Container>
		) : null;

	return (
		<PopoverContent
			{...props}
			className={cn('hide-scrollbar overflow-hidden p-0', className)}
			data-slot="select-content"
			role="listbox"
			aria-multiselectable={type === 'multiple'}
		>
			{searchInput}
			<Container className="flex flex-col py-1 ps-1 pe-0">
				{filteredChildren}
				{noMatchBlock}
			</Container>
		</PopoverContent>
	);
}

/**
 * @description Selectable list option that toggles inclusion in the current value array and keeps the trigger's rendered labels in sync for single and multi-select modes.
 * @returns {JSX.Element} The SelectWithSearchItem component.
 */
export function SelectWithSearchItem({
	value,
	onClick,
	className,
	children,
	...props
}: SelectItemPropsType): JSX.Element {
	const { onOpenChange, onValueChange, value: selectedValue, setSelectedChildren, type } = useContext(SelectContext);

	const handleSelect = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		onClick?.(event);

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
			setSelectedChildren((previous) => previous.filter((child) => child.id !== value));
		} else {
			setSelectedChildren((previous) => [...previous, { id: value, element: children }]);
		}
	};

	return (
		<Button
			variant="ghost"
			{...props}
			onClick={handleSelect}
			className={cn(
				'relative h-7 justify-start pr-12 pl-2 font-normal',
				selectedValue.includes(value) && 'font-medium',
				className,
			)}
			data-slot="select-item"
			data-value={value}
			role="option"
			aria-selected={selectedValue.includes(value)}
		>
			{children}

			{selectedValue.includes(value) && (
				<CheckIcon className="absolute inset-[0_5px_0_auto] my-auto size-4" aria-hidden="true" />
			)}
		</Button>
	);
}

/**
 * @description Text input bound to the select context that drives client-side filtering and can optionally surface an "add new" affordance when no items match.
 * @returns {JSX.Element} The SelectSearch component.
 */
export function SelectSearch({ className, ...props }: SelectSearchPropsType): JSX.Element {
	const { searchTerm, setSearchTerm } = useContext(SelectContext);

	return (
		<Container className="relative">
			<Input
				autoFocus={true}
				inputSize="full"
				placeholder="Search..."
				aria-label="Search items"
				{...props}
				value={searchTerm}
				onChange={(event): void => setSearchTerm(event.target.value)}
				className={cn(
					'mb-0.5 w-full rounded-none border-x-0 border-t-0 border-b-2 border-muted-light px-8 py-2 outline-none',
					className,
				)}
				data-slot="select-search"
				role="searchbox"
			/>
			<SearchIcon
				className="absolute inset-[0_auto_0_5px] inset-y-0 my-auto ml-1 size-4 text-muted-foreground"
				aria-hidden="true"
			/>
		</Container>
	);
}
