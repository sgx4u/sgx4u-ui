'use client';

import {
	Children,
	createContext,
	Fragment,
	isValidElement,
	JSX,
	JSXElementConstructor,
	ReactElement,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent as ReactMouseEvent,
	ReactNode,
	useContext,
	useEffect,
	useLayoutEffect,
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
	type: 'single',
	openedViaKeyboard: { current: false },
});

/**
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
	const [allSelectItems, setAllSelectItems] = useState<Array<ReactElement<SelectItemPropsType>>>([]);

	const openedViaKeyboardRef = useRef(false);

	/** Controlled + Uncontrolled sync. */
	const currentValue = value ?? internalValue;
	const currentOpen = open ?? internalOpen;

	const selectedChildren = allSelectItems.filter((item) => currentValue.includes(item.props.value));

	const handleValueChange = (newValue: Array<string>): void => {
		onValueChange?.(newValue);
		if (value === undefined) setInternalValue(newValue);
	};

	const handleOpenChange = (newOpen: boolean): void => {
		onOpenChange?.(newOpen);
		if (open === undefined) setInternalOpen(newOpen);
		if (!newOpen) openedViaKeyboardRef.current = false;
	};

	/** Collect all select items when the children change. */
	useEffect(() => {
		const getAllSelectItems = (root: ReactNode): Array<ReactElement<SelectItemPropsType>> => {
			const items: Array<ReactElement<SelectItemPropsType>> = [];

			/* Traverse the children of the root node and collect all SelectItem elements. */
			const traverse = (nodes: ReactNode, insideSelectContent: boolean): void => {
				Children.forEach(nodes, (child) => {
					if (!isValidElement(child)) return;
					const props = child.props as { children?: ReactNode };
					const isSelectContent =
						(child.type as JSXElementConstructor<SelectContentPropsType>).name === 'SelectContent';
					const isSelectItem =
						(child.type as JSXElementConstructor<SelectItemPropsType>).name === 'SelectItem';

					/* If the child is a SelectContent, traverse its children. */
					if (isSelectContent) {
						traverse(props.children, true);
						return;
					}
					/* If the child is a SelectItem, add it to the items array. */
					if (insideSelectContent && isSelectItem) {
						items.push(child as ReactElement<SelectItemPropsType>);
					}
					/* If the child has children, traverse them. */
					if (insideSelectContent && props.children != null) {
						traverse(props.children, true);
					}
				});
			};

			/* Start the traversal from the root node. */
			traverse(root, false);
			return items;
		};

		const allSelectItems = getAllSelectItems(children);
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setAllSelectItems(allSelectItems);
	}, [children]);

	return (
		<SelectContext.Provider
			value={{
				open: currentOpen,
				onOpenChange: handleOpenChange,
				value: currentValue,
				onValueChange: handleValueChange,
				selectedChildren,
				type,
				openedViaKeyboard: openedViaKeyboardRef,
			}}
		>
			<Popover sideOffset={4} {...props} open={currentOpen} onOpenChange={handleOpenChange} data-slot="select">
				{children}
			</Popover>
		</SelectContext.Provider>
	);
}

/**
 * @description Button trigger that renders the current selection as inline chips with separators and exposes listbox-related ARIA attributes.
 * @returns {JSX.Element} The SelectTrigger component.
 */
export function SelectTrigger({
	onKeyDown,
	className,

	arrowClassName,
	arrowProps,

	children,
	...props
}: SelectTriggerPropsType): JSX.Element {
	const { open, selectedChildren, openedViaKeyboard: openedViaKeyboardRef } = useContext(SelectContext);

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		if (event.key === 'Enter' || event.key === ' ') openedViaKeyboardRef.current = true;
		onKeyDown?.(event);
	};

	return (
		<PopoverTrigger
			variant="outline"
			{...props}
			onKeyDown={handleKeyDown}
			className={cn('flex items-center justify-between gap-1', className)}
			data-slot="select-trigger"
			aria-haspopup="listbox"
			aria-expanded={open}
		>
			{selectedChildren.length > 0 ? (
				<Container className="flex items-center gap-2 overflow-hidden">
					{selectedChildren.map((item, index) => (
						<Fragment key={item.props.value}>
							<Container>{item.props.children}</Container>
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
				className={cn('ml-3 size-4 transition-transform', open && 'rotate-180', arrowClassName)}
				aria-hidden="true"
				{...arrowProps}
			/>
		</PopoverTrigger>
	);
}

/**
 * @description Popover content wrapper that lays out select options in a scrollable column.
 * @returns {JSX.Element} The SelectContent component.
 */
export function SelectContent({ className, style, ...props }: SelectContentPropsType): JSX.Element {
	const { open, value: selectedValue, type, openedViaKeyboard } = useContext(SelectContext);
	const { defaultPopoverId, getTriggerElement } = usePopoverContext();

	const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

	/** Match content width to trigger width when open. */
	useLayoutEffect(() => {
		if (!open) return;

		const triggerElement = getTriggerElement(defaultPopoverId);
		if (!triggerElement) return;

		/* Get the width of the trigger element. */
		const width = triggerElement.getBoundingClientRect().width;
		const timeoutId = setTimeout(() => setTriggerWidth(width), 0);

		return (): void => clearTimeout(timeoutId);
	}, [open, defaultPopoverId, getTriggerElement]);

	/** Update content width when trigger or window resizes while open. */
	useEffect(() => {
		if (!open) return;

		const triggerElement = getTriggerElement(defaultPopoverId);
		if (!triggerElement) return;

		/* Get the width of the trigger element. */
		const updateWidth = (): void => setTriggerWidth(triggerElement.getBoundingClientRect().width);

		window.addEventListener('resize', updateWidth);
		const resizeObserver = new ResizeObserver(updateWidth);
		resizeObserver.observe(triggerElement);

		/* Remove the resize listener and the resize observer when the component unmounts. */
		return (): void => {
			window.removeEventListener('resize', updateWidth);
			resizeObserver.disconnect();
		};
	}, [open, defaultPopoverId, getTriggerElement]);

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
			{...props}
			style={{
				...(triggerWidth != null && { width: triggerWidth }),
				...style,
			}}
			className={cn('hide-scrollbar flex max-h-96 min-w-max flex-col py-1 ps-1 pe-0', className)}
			data-slot="select-content"
			role="listbox"
			aria-multiselectable={type === 'multiple'}
		/>
	);
}

/**
 * @description Interactive option that toggles its value within the current selection array and visually marks selected items with a check icon.
 * @returns {JSX.Element} The SelectItem component.
 */
export function SelectItem({
	value,
	onClick,
	onKeyDown,
	className,
	children,
	...props
}: SelectItemPropsType): JSX.Element {
	const { onOpenChange, onValueChange, value: selectedValue, type } = useContext(SelectContext);

	const handleSelect = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		onClick?.(event);

		if (type === 'single') {
			onValueChange([value]);
			onOpenChange(false);
			return;
		}

		const newSelectedValue = selectedValue.includes(value)
			? selectedValue.filter((existingValue) => existingValue !== value)
			: [...selectedValue, value];

		onValueChange(newSelectedValue);
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		selectItemOnKeyDownHelper(event);
		onKeyDown?.(event);
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			{...props}
			onClick={handleSelect}
			onKeyDown={handleKeyDown}
			className={cn(
				'relative h-7 justify-start pr-12 pl-2 font-normal',
				selectedValue.includes(value) && 'font-semibold',
				className,
			)}
			data-slot="select-item"
			data-value={value}
			role="option"
			aria-selected={selectedValue.includes(value)}
		>
			{children}

			{selectedValue.includes(value) && (
				<CheckIcon className="absolute inset-[0_5px_0_auto] my-auto stroke-3" aria-hidden="true" />
			)}
		</Button>
	);
}
