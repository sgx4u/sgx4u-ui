'use client';

import {
	createContext,
	JSX,
	KeyboardEvent as ReactKeyboardEvent,
	useCallback,
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
import { slidePanel } from '../../helpers/slide-panel.helper';
import { accordionOnKeyDownHelper } from './accordion.helper';

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

	/**
	 * @description Registers an item or body element in the items map, keyed by the item value.
	 * @param {object} props - The registration props.
	 * @param {string} props.value - The unique value of the accordion item.
	 * @param {HTMLElement} [props.element] - The element to register.
	 * @param {'item' | 'body'} [props.type] - Which part of the item the element represents.
	 * @returns {void}
	 */
	const registerItem = useCallback(
		({ value, element, type }: { value: string; element?: HTMLElement; type?: 'item' | 'body' }): void => {
			if (!element || !type) return;
			const current = itemsMap.current.get(value) || { item: null, body: null };
			itemsMap.current.set(value, { ...current, [type]: element });
		},
		[],
	);

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

		onOpenItemsChange?.(nextValue);
		if (openItems === undefined) setInternalOpenItems(nextValue);

		/** Get the item element from the items map. */
		const entry = itemsMap.current.get(itemValue);
		if (!entry || !entry.body) return;

		const effectiveSpeed = prefersReducedMotion ? 0 : speed;

		if (nextValue.includes(itemValue)) slidePanel({ element: entry.body, speed: effectiveSpeed, action: 'down' });
		else slidePanel({ element: entry.body, speed: effectiveSpeed, action: 'up' });

		/** If single type, collapse all other items when the current item is opened. */
		if (type === 'single') {
			itemsMap.current.forEach((other, key) => {
				if (key === itemValue) return;
				if (other.body) slidePanel({ element: other.body, speed: effectiveSpeed, action: 'up' });
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
			<Container className={cn('h-full w-full divide-y px-4 py-4', className)} data-slot="accordion" {...props} />
		</AccordionContext.Provider>
	);
}

const AccordionItemContext = createContext<AccordionItemContextType>({
	value: '',
});

/**
 * @description Accesses the current accordion item context, guarding against usage outside an AccordionItem.
 * @returns {AccordionItemContextType} The current accordion item context.
 */
export function useAccordionItem(): AccordionItemContextType {
	const context = useContext(AccordionItemContext);
	if (!context.value) throw new Error('AccordionItem components must be used inside <AccordionItem>.');
	return context;
}

/**
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

	const isOpen = openItems.includes(value);

	return (
		<AccordionItemContext.Provider value={{ value }}>
			<Container
				ref={itemElementRef}
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
 * @description Button trigger that toggles its associated section, rotates the chevron icon, and links header and panel with synchronized ARIA attributes.
 * @returns {JSX.Element} The AccordionTrigger component.
 */
export function AccordionTrigger({
	onKeyDown,

	hideArrow,
	headingLevel = 3,
	variant = 'ghost',
	className,

	children,
	...props
}: AccordionTriggerPropsType): JSX.Element {
	const { onToggle, openItems } = useContext(AccordionContext);
	const { value } = useAccordionItem();

	const isOpen = value && openItems.includes(value);

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		onKeyDown?.(event);
		accordionOnKeyDownHelper(event);
	};

	return (
		<div role="heading" aria-level={headingLevel} data-slot="accordion-header">
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
				{...props}
			>
				{children}

				{!hideArrow && (
					<ChevronDownIcon
						className={cn(
							'size-4 shrink-0 text-muted-dark transition-all dark:text-muted-light',
							isOpen && 'rotate-180',
						)}
						aria-hidden="true"
					/>
				)}
			</Button>
		</div>
	);
}

/**
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

	const isOpen = value && openItems.includes(value);

	return (
		<Container
			ref={contentElementRef}
			id={value ? `accordion-content-${value}` : undefined}
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
