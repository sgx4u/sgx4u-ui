'use client';

import {
	createContext,
	JSX,
	KeyboardEvent as ReactKeyboardEvent,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { ChevronDownIcon } from 'lucide-react';

import {
	AccordionContentPropsType,
	AccordionContextType,
	AccordionItemContextType,
	AccordionItemPropsType,
	AccordionPropsType,
	AccordionTriggerPropsType,
} from './accordion.type';
import { cn } from '../../utils/styles.util';
import { accordionOnKeyDownHelper, slideAccordion } from './accordion.helper';

import { useReducedMotion } from '../../hooks/useReducedMotion.hook';

import { Button } from '../button';
import { Container } from '../container';

const AccordionContext = createContext<AccordionContextType>({
	openItems: [],
	onToggle: () => {},
	registerItem: () => {},
	type: 'multiple',
});

/**
 * @name Accordion
 * @description A vertically stacked list of items where each item can be expanded or collapsed to reveal or hide content.
 * @returns {JSX.Element} The Accordion component.
 */
export function Accordion({
	openItems,
	defaultOpenItems,
	onOpenItemsChange,

	type = 'multiple',
	speed = 150,
	className,

	...props
}: AccordionPropsType): JSX.Element {
	/** Internal value state when the openItems prop is not provided. */
	const [internalOpenItems, setInternalOpenItems] = useState<Array<string>>(defaultOpenItems ?? []);

	const prefersReducedMotion = useReducedMotion();

	/** Controlled + Uncontrolled sync. */
	const currentOpenItems = openItems ?? internalOpenItems;

	/** Items map (stores both item & body). */
	const itemsMap = useRef<Map<string, { item: HTMLElement | null; body: HTMLElement | null }>>(new Map());

	const registerItem = ({
		value,
		element,
		type,
	}: {
		value: string;
		element?: HTMLElement;
		type?: 'item' | 'body';
	}): void => {
		if (!element || !type) return;
		const current = itemsMap.current.get(value) || { item: null, body: null };
		itemsMap.current.set(value, { ...current, [type]: element });
	};

	const handleToggle = (itemValue: string): void => {
		let nextValue = [...currentOpenItems];

		/** Calculate the next values of the open items. */
		if (type === 'single') {
			nextValue = nextValue.includes(itemValue) ? [] : [itemValue];
		} else {
			nextValue = nextValue.includes(itemValue)
				? nextValue.filter((item) => item !== itemValue)
				: [...nextValue, itemValue];
		}

		/** Update the open items. */
		onOpenItemsChange?.(nextValue);
		if (openItems === undefined) setInternalOpenItems(nextValue);

		/** Get the item element from the items map. */
		const entry = itemsMap.current.get(itemValue);
		if (!entry || !entry.body) return;

		const effectiveSpeed = prefersReducedMotion ? 0 : speed;

		if (nextValue.includes(itemValue))
			slideAccordion({ element: entry.body, speed: effectiveSpeed, action: 'down' });
		else slideAccordion({ element: entry.body, speed: effectiveSpeed, action: 'up' });

		/** If single type, collapse all other items when the current item is opened. */
		if (type === 'single') {
			itemsMap.current.forEach((other, key) => {
				if (key === itemValue) return;
				if (other.body) slideAccordion({ element: other.body, speed: effectiveSpeed, action: 'up' });
			});
		}
	};

	return (
		<AccordionContext.Provider
			value={{
				openItems: currentOpenItems,
				onToggle: handleToggle,
				registerItem: registerItem,
				type,
			}}
		>
			<Container
				as="div"
				className={cn('h-full w-full divide-y px-4 py-4', className)}
				data-slot="accordion"
				role="presentation"
				aria-label="Accordion section"
				{...props}
			/>
		</AccordionContext.Provider>
	);
}

const AccordionItemContext = createContext<AccordionItemContextType>({
	value: '',
});

export const useAccordionItem = (): AccordionItemContextType => {
	const context = useContext(AccordionItemContext);
	if (!context) throw new Error('AccordionItem components must be used inside <AccordionItem>');
	return context;
};

/**
 * @name Accordion Item
 * @description Wrapper for a single accordion section that registers itself with the root context and exposes open/closed state through data attributes.
 * @returns {JSX.Element} The AccordionItem component.
 */
export function AccordionItem({ value, className, ...props }: AccordionItemPropsType): JSX.Element {
	const { openItems, registerItem } = useContext(AccordionContext);

	const itemElementRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!itemElementRef.current) return;
		registerItem({ value, element: itemElementRef.current, type: 'item' });
	}, [value, registerItem]);

	/** Check if the item is currently open. */
	const isOpen = openItems.includes(value);

	return (
		<AccordionItemContext.Provider value={{ value }}>
			<Container
				ref={itemElementRef}
				as="div"
				className={cn('group/accordion-item', className)}
				data-slot="accordion-item"
				data-state={isOpen ? 'open' : 'closed'}
				role="group"
				{...props}
			/>
		</AccordionItemContext.Provider>
	);
}

/**
 * @name Accordion Trigger
 * @description Button trigger that toggles its associated section, rotates the chevron icon, and links header and panel with synchronized ARIA attributes.
 * @returns {JSX.Element} The AccordionTrigger component.
 */
export function AccordionTrigger({
	onKeyDown,

	hideArrow,
	variant = 'ghost',
	className,

	children,
	...props
}: AccordionTriggerPropsType): JSX.Element {
	const { onToggle, openItems } = useContext(AccordionContext);
	const { value } = useAccordionItem();

	/** Check if the item is currently open. */
	const isOpen = value && openItems.includes(value);

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		onKeyDown?.(event);
		accordionOnKeyDownHelper(event);
	};

	return (
		<Button
			id={`accordion-trigger-${value}`}
			onClick={() => value && onToggle(value)}
			onKeyDown={handleKeyDown}
			variant={variant}
			className={cn(
				'w-full justify-between group-first/accordion-item:rounded-b-none group-last/accordion-item:rounded-t-none group-[&:not(:first-child):not(:last-child)]/accordion-item:rounded-none',
				isOpen && 'group-last/accordion-item:rounded-b-none',
				className,
			)}
			data-slot="accordion-trigger"
			data-value={value}
			aria-controls={value ? `accordion-content-${value}` : undefined}
			aria-expanded={Boolean(isOpen)}
			aria-disabled={false}
			{...props}
		>
			{children}

			{/* Icon to indicate the open state. */}
			{!hideArrow && (
				<ChevronDownIcon
					className={cn('size-4 shrink-0 transition-all', isOpen && 'rotate-180')}
					aria-hidden="true"
				/>
			)}
		</Button>
	);
}

/**
 * @name Accordion Content
 * @description Collapsible panel region that animates its height and opacity.
 * @returns {JSX.Element} The AccordionContent component.
 */
export function AccordionContent({ className, ...props }: AccordionContentPropsType): JSX.Element {
	const { openItems, registerItem } = useContext(AccordionContext);
	const { value } = useAccordionItem();

	const contentElementRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!contentElementRef.current) return;
		registerItem({ value: value ?? '', element: contentElementRef.current, type: 'body' });
	}, [registerItem, value]);

	/** Check if the item is currently open. */
	const isOpen = value && openItems.includes(value);

	return (
		<Container
			ref={contentElementRef}
			id={value ? `accordion-content-${value}` : undefined}
			as="div"
			className={cn(
				'p-4 transition-opacity duration-75',
				isOpen ? 'h-auto overflow-hidden' : 'hidden opacity-0',
				className,
			)}
			data-slot="accordion-content"
			role="region"
			aria-labelledby={value ? `accordion-trigger-${value}` : undefined}
			aria-hidden={!isOpen}
			{...props}
		/>
	);
}
