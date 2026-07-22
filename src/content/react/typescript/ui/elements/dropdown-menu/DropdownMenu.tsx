'use client';

import {
	createContext,
	JSX,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent as ReactMouseEvent,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { ChevronRightIcon } from 'lucide-react';

import {
	DropdownMenuContentPropsType,
	DropdownMenuContextType,
	DropdownMenuItemPropsType,
	DropdownMenuLabelPropsType,
	DropdownMenuPropsType,
	DropdownMenuSeparatorPropsType,
	DropdownMenuSubContentPropsType,
	DropdownMenuSubContextType,
	DropdownMenuSubPropsType,
	DropdownMenuSubTriggerPropsType,
	DropdownMenuTriggerPropsType,
} from './dropdown-menu.type';
import { cn } from '../../utils/styles.util';
import {
	dropdownMenuItemOnKeyDownHelper,
	dropdownMenuSubContentItemOnKeyDownHelper,
	dropdownMenuSubTriggerOnKeyDownHelper,
} from './dropdown-menu-keydown.helper';

import { Button } from '../button';
import { Label } from '../label';
import { Popover, PopoverContent, PopoverTrigger, usePopoverContext } from '../popover';
import { Separator } from '../separator';

/** DropdownMenu context. */
const DropdownMenuContext = createContext<DropdownMenuContextType>({
	open: false,
	onOpenChange: () => {},
});

/**
 * @description A menu that appears when a user interacts with a trigger, typically used for contextual actions and navigation.
 * @returns {JSX.Element} The DropdownMenu component.
 */
export function DropdownMenu({ open, onOpenChange, children, ...props }: DropdownMenuPropsType): JSX.Element {
	/** Internal open state when open is not provided. */
	const [internalOpen, setInternalOpen] = useState(false);

	/** Controlled + Uncontrolled sync. */
	const currentOpen = open ?? internalOpen;

	const handleOpenChange = (newOpen: boolean): void => {
		onOpenChange?.(newOpen);
		if (open === undefined) setInternalOpen(newOpen);
	};

	return (
		<DropdownMenuContext.Provider
			value={{
				open: currentOpen,
				onOpenChange: handleOpenChange,
			}}
		>
			<Popover open={currentOpen} onOpenChange={handleOpenChange} trapFocus={false} {...props}>
				{children}
			</Popover>
		</DropdownMenuContext.Provider>
	);
}

/**
 * @description Button trigger that toggles the dropdown menu open state and exposes ARIA menu semantics for assistive technologies.
 * @returns {JSX.Element} The DropdownMenuTrigger component.
 */
export function DropdownMenuTrigger(props: DropdownMenuTriggerPropsType): JSX.Element {
	return <PopoverTrigger {...props} data-slot="dropdown-menu-trigger" aria-haspopup="menu" />;
}

/**
 * @description Positioned dropdown menu content that displays menu items and supports keyboard navigation.
 * @returns {JSX.Element} The DropdownMenuContent component.
 */
export function DropdownMenuContent({ className, ...props }: DropdownMenuContentPropsType): JSX.Element {
	const { open } = useContext(DropdownMenuContext);
	const { defaultPopoverId } = usePopoverContext();

	/** Move focus to the first item when the menu opens so keyboard navigation works regardless of how it was opened. */
	useEffect(() => {
		if (!open) return;

		const timeoutId = setTimeout(() => {
			const menuContainer = document.getElementById(`popover-${defaultPopoverId}`);
			if (!menuContainer) return;

			const menuItems = Array.from(
				menuContainer.querySelectorAll<HTMLButtonElement>(
					'[data-slot="dropdown-menu-item"], [data-slot="dropdown-menu-sub-trigger"]',
				),
			).filter((item) => !item.disabled);

			menuItems[0]?.focus();
		}, 50);

		return (): void => clearTimeout(timeoutId);
	}, [open, defaultPopoverId]);

	return (
		<PopoverContent
			{...props}
			className={cn('flex flex-col gap-0.5 p-1', className)}
			data-slot="dropdown-menu-content"
			role="menu"
		/>
	);
}

/**
 * @description An individual menu item that can be selected or triggered.
 * @returns {JSX.Element} The DropdownMenuItem component.
 */
export function DropdownMenuItem({
	onClick,
	onKeyDown,
	doNotCloseOnClick,

	className,

	...props
}: DropdownMenuItemPropsType): JSX.Element {
	const { onOpenChange } = useContext(DropdownMenuContext);
	const { onOpenChange: subOnOpenChange, subTriggerRef } = useContext(DropdownMenuSubContext);

	const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		onClick?.(event);
		if (!doNotCloseOnClick) {
			subOnOpenChange(false);
			onOpenChange(false);
		}
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		const isActionPossible = dropdownMenuSubContentItemOnKeyDownHelper({
			event,
			onOpenChange: subOnOpenChange,
			subTriggerRef,
		});
		if (isActionPossible) return;

		onKeyDown?.(event);
		dropdownMenuItemOnKeyDownHelper(event);
	};

	return (
		<Button
			variant="ghost"
			{...props}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			className={cn('h-7 justify-start rounded-sm px-1.5', className)}
			data-slot="dropdown-menu-item"
			role="menuitem"
		/>
	);
}

/**
 * @description A label or heading for a group of menu items.
 * @returns {JSX.Element} The DropdownMenuLabel component.
 */
export function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelPropsType): JSX.Element {
	return (
		<Label
			{...props}
			size="sm"
			className={cn('px-1.5 font-normal text-muted-dark', className)}
			data-slot="dropdown-menu-label"
		/>
	);
}

/**
 * @description A visual separator between groups of menu items.
 * @returns {JSX.Element} The DropdownMenuSeparator component.
 */
export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorPropsType): JSX.Element {
	return (
		<Separator thickness="thin" {...props} className={cn('my-1', className)} data-slot="dropdown-menu-separator" />
	);
}

const DropdownMenuSubContext = createContext<DropdownMenuSubContextType>({
	open: false,
	onOpenChange: () => {},
	subTriggerRef: undefined,
});

/**
 * @description A container for nested sub-menu items.
 * @returns {JSX.Element} The DropdownMenuSub component.
 */
export function DropdownMenuSub({
	open,
	onOpenChange,

	side = 'right',
	align = 'start',
	sideOffset = 8,

	children,

	...props
}: DropdownMenuSubPropsType): JSX.Element {
	const { open: parentOpen } = useContext(DropdownMenuContext);

	/** Internal open state when open is not provided. */
	const [internalOpen, setInternalOpen] = useState(false);

	/** Ref to the sub-trigger so we can return focus when closing submenu via ArrowLeft from inside sub-content. */
	const subTriggerRef = useRef<HTMLButtonElement | null>(null);

	/** Derive effective open: close automatically when the parent menu closes. */
	const subShouldOpen = (open ?? internalOpen) && parentOpen;

	const handleOpenChange = (newOpen: boolean): void => {
		onOpenChange?.(newOpen);
		if (open === undefined) setInternalOpen(newOpen);
	};

	return (
		<DropdownMenuSubContext.Provider value={{ open: subShouldOpen, onOpenChange: handleOpenChange, subTriggerRef }}>
			<Popover
				open={subShouldOpen}
				onOpenChange={handleOpenChange}
				side={side}
				align={align}
				sideOffset={sideOffset}
				data-slot="dropdown-menu-sub"
				{...props}
			>
				{children}
			</Popover>
		</DropdownMenuSubContext.Provider>
	);
}

/**
 * @description A trigger item that opens a nested sub-menu.
 * @returns {JSX.Element} The DropdownMenuSubTrigger component.
 */
export function DropdownMenuSubTrigger({
	onKeyDown,
	ref: refFromProps,

	className,

	children,
	...props
}: DropdownMenuSubTriggerPropsType): JSX.Element {
	const { onOpenChange: parentOnOpenChange } = useContext(DropdownMenuContext);
	const { open, onOpenChange, subTriggerRef } = useContext(DropdownMenuSubContext);

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		dropdownMenuItemOnKeyDownHelper(event);
		dropdownMenuSubTriggerOnKeyDownHelper({ event, onOpenChange, parentOnOpenChange, open });
		onKeyDown?.(event);
	};

	/**
	 * Merges the context ref (for ArrowLeft focus return) with any ref passed from props.
	 * @param {HTMLButtonElement | null} element - The trigger DOM element.
	 * @returns {void}
	 */
	const setRef = (element: HTMLButtonElement | null): void => {
		if (subTriggerRef) subTriggerRef.current = element;
		if (typeof refFromProps === 'function') refFromProps(element);
		else if (refFromProps) refFromProps.current = element;
	};

	return (
		<PopoverTrigger
			ref={setRef}
			variant="ghost"
			{...props}
			onKeyDown={handleKeyDown}
			className={cn(
				'h-7 justify-start rounded-sm px-1.5 [&:not(:has([data-slot=keyboard-shortcut]))]:gap-8',
				className,
			)}
			data-slot="dropdown-menu-sub-trigger"
			role="menuitem"
			aria-haspopup="menu"
		>
			{children}
			<ChevronRightIcon
				className={cn('ml-auto size-4 transition-transform', open && 'rotate-90')}
				aria-hidden="true"
			/>
		</PopoverTrigger>
	);
}

/**
 * @description Positioned sub-menu content that displays nested menu items.
 * @returns {JSX.Element} The DropdownMenuSubContent component.
 */
export function DropdownMenuSubContent({ className, ...props }: DropdownMenuSubContentPropsType): JSX.Element {
	return (
		<PopoverContent
			{...props}
			className={cn('flex flex-col gap-0.5 p-1', className)}
			data-slot="dropdown-menu-sub-content"
			role="menu"
		/>
	);
}
