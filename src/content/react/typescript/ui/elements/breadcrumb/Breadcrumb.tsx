'use client';

import { createContext, JSX, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';

import {
	BreadcrumbContextType,
	BreadcrumbEllipsisPropsType,
	BreadcrumbItemPropsType,
	BreadcrumbPropsType,
	BreadcrumbSeparatorPropsType,
	RegisterItemPropsType,
} from './breadcrumb.type';
import { cn } from '../../utils/styles.util';

import { useWindowResize } from '../../hooks/useWindowResize.hook';

import { Container } from '../container';
import { Link } from '../link';
import { List } from '../list';
import { ListItem } from '../list-item';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

/** Context for the Breadcrumb component. */
const BreadcrumbContext = createContext<BreadcrumbContextType>({
	breadcrumbUid: '',
	childElements: {},
	registerItem: () => null,
	setEllipsisWidth: () => {},

	popoverProps: {},
	popoverTriggerProps: {},
	popoverContentProps: {},
});

/**
 * @name Breadcrumb
 * @description A horizontal trail of links that helps users understand and navigate the hierarchy of a site or app.
 * @param {BreadcrumbPropsType} props - The props for the Breadcrumb component.
 * @returns {JSX.Element} The Breadcrumb component.
 * @summary The idea is as following:
 * 1. Each breadcrumb item and separator is registered to identify its position and type.
 * 2. The first (item & separator) and last (separator & item) are not hidden.
 * 2. When the window resizes, the width of the breadcrumb container and all the visible child is calculated.
 * 3. If the window is shrinking and the total width of the visible child elements is greater than the width of the breadcrumb container, elements from start to end after the first (item & separator) starts to be hidden until the total width of the visible child elements is less than the width of the breadcrumb container.
 * 4. If the window is expanding and the total width of the visible child elements is less than the width of the breadcrumb container, elements from end to start before the last (separator & item) starts to be shown until the total width of the visible child elements is just close to the width of the breadcrumb container but not greater.
 * 5. The hidden elements are shown in a popover on hover if there are any hidden elements.
 */
export function Breadcrumb({
	className,
	children,

	listProps,
	popoverProps,
	popoverTriggerProps,
	popoverContentProps,
	...props
}: BreadcrumbPropsType): JSX.Element {
	/** Window resize direction to determine from which side the breadcrumb items should be hidden or shown. */
	const { resizeDirection } = useWindowResize();

	/** Store the child elements. */
	const [childElements, setChildElements] = useState<Record<string, RegisterItemPropsType>>({});

	/** Store the width of the ellipsis (collapsed popover trigger). */
	const ellipsisWidthRef = useRef(0);

	/** Unique identifier to identify the breadcrumb element. */
	const breadcrumbUid = useId();

	const registerItem = (element: HTMLElement): RegisterItemPropsType | null => {
		if (element.getAttribute('data-id')) return null;

		/** Get the breadcrumb container. */
		const breadcrumb = document.querySelector(`[data-uid="${breadcrumbUid}"][data-slot="breadcrumb"]`);
		if (!breadcrumb) return null;

		/** Get all the child elements. */
		const items = Array.from(
			breadcrumb.querySelectorAll('[data-slot="breadcrumb-item"], [data-slot="breadcrumb-separator"]'),
		);

		const index = items.findIndex((item) => item === element);
		const type = element.dataset.slot === 'breadcrumb-item' ? 'item' : 'separator';

		/** Generate a new element id to uniquely identify the element. */
		const newElementId = type === 'item' ? `breadcrumb-item-${index}` : `breadcrumb-separator-${index}`;
		element.setAttribute('data-id', newElementId);

		const registeredElement = {
			index,
			type,
			width: element.offsetWidth,
			isVisible: true,
			link: element.getAttribute('href') ?? '',
			label: element.textContent,
		} as const;

		/** Register the element. */
		setChildElements((prev) => {
			/** Check if the element is already registered. */
			const elementAlreadyRegistered = prev[newElementId];
			if (elementAlreadyRegistered) return prev;

			return { ...prev, [newElementId]: registeredElement };
		});

		return registeredElement;
	};

	const setEllipsisWidth = (width: number): void => {
		ellipsisWidthRef.current = width;
	};

	useEffect(() => {
		const calculateChildElementState = (): void => {
			/** Get the breadcrumb container. */
			const breadcrumb = document.querySelector(
				`[data-uid="${breadcrumbUid}"][data-slot="breadcrumb"]`,
			) as HTMLElement | null;
			if (!breadcrumb) return;

			/** Get the width of the breadcrumb container. */
			const breadcrumbWidth = breadcrumb.offsetWidth;
			/** Get the width of all the visible child elements. */
			const childElementsWidth = Object.values(childElements).reduce((acc, item: RegisterItemPropsType) => {
				if (!item.isVisible) return acc;
				acc = acc + item.width;
				return acc;
			}, ellipsisWidthRef.current);

			/** If the window is shrinking and the total width of the visible child elements is greater than the width of the breadcrumb container, elements from start to end after the first (item & separator) starts to be hidden until the total width of the visible child elements is less than the width of the breadcrumb container. */
			const isInitialOrShrinking = resizeDirection === null || resizeDirection === 'shrinking';

			if (isInitialOrShrinking && childElementsWidth > breadcrumbWidth) {
				const widthDifference = childElementsWidth - breadcrumbWidth;

				/** Initialize the width to hide. */
				let updatedWidthToHide = 0;
				const itemsToHide: Array<string> = [];

				/** While the width to hide is less than the width difference, find the next visible item to hide. */
				while (updatedWidthToHide < widthDifference) {
					/**
					 * Get all the child elements in order.
					 * This is because we want to hide the items from start to end after the first (item & separator).
					 */
					const itemsInOrder = Object.keys(childElements).sort(
						(a, b) => Number(a.split('-').pop()) - Number(b.split('-').pop()),
					);

					/**
					 * Find the next visible item to hide.
					 * index > 1 because the first (item & separator) are not hidden.
					 * index < itemsInOrder.length - 2 because the last (separator & item) are not hidden.
					 * !itemsToHide.includes(item) because the item is not already included in the items to hide.
					 */
					const nextVisibleItem = itemsInOrder.find(
						(item, index) =>
							index > 1 &&
							index < itemsInOrder.length - 2 &&
							childElements[item].isVisible &&
							!itemsToHide.includes(item),
					);
					if (!nextVisibleItem) break;

					/** Add the item to the items to hide. */
					itemsToHide.push(nextVisibleItem);
					/** Add the width of the item to the width to hide. */
					updatedWidthToHide = updatedWidthToHide + childElements[nextVisibleItem].width;
				}

				/**
				 * If the only item to hide is a separator, return.
				 * This is because when we hide we want to do it in pairs of (item & separator).
				 * Otherwise we will end up with items without separators on the left side.
				 */
				if (itemsToHide.length === 1 && itemsToHide[0].startsWith('breadcrumb-separator-')) return;

				/** Set the child elements. */
				setChildElements((prev) => {
					/** Get the updated child elements. */
					const updatedChildElements = { ...prev };
					/** Set the visibility of the items to hide to false. */
					itemsToHide.forEach((item) => (updatedChildElements[item].isVisible = false));
					return updatedChildElements;
				});

				return;
			}

			/** If the window is expanding and the total width of the visible child elements is less than the width of the breadcrumb container, elements from end to start before the last (separator & item) starts to be shown until the total width of the visible child elements is just close to the width of the breadcrumb container but not greater. */
			if (resizeDirection === 'expanding' && childElementsWidth < breadcrumbWidth) {
				/** Check if there are any hidden items. */
				const isItemHidden = Object.values(childElements).some((item) => !item.isVisible);
				if (!isItemHidden) return;

				/** Get the width difference. */
				const widthDifference = breadcrumbWidth - childElementsWidth;

				/** Initialize the width to show. */

				let updatedWidthToShow = 0;
				/** Initialize the width to show satisfied. */
				let updatedWidthToShowSatisfied = false;
				/** Initialize the items to show. */
				const itemsToShow: Array<string> = [];

				/** While the width to show is less than the width difference, find the next hidden item to show. */
				while (!updatedWidthToShowSatisfied) {
					/**
					 * Get all the child elements in reverse order.
					 * This is because we want to show the items from end to start before the last (separator & item).
					 */
					const itemsInOrder = Object.keys(childElements).sort(
						(a, b) => Number(b.split('-').pop()) - Number(a.split('-').pop()),
					);

					/**
					 * Find the next hidden item to show.
					 * index > 1 because the last (item & separator) are not hidden.
					 * index < itemsInOrder.length - 2 because the first (separator & item) are not hidden.
					 * !itemsToShow.includes(item) because the item is not already included in the items to show.
					 */
					const nextHiddenItem = itemsInOrder.find(
						(item, index) =>
							index > 1 &&
							index < itemsInOrder.length - 2 &&
							!childElements[item].isVisible &&
							!itemsToShow.includes(item),
					);
					if (!nextHiddenItem) break;

					/** If the width to show is less than the width difference, add the item to the items to show. */
					if (updatedWidthToShow + childElements[nextHiddenItem].width <= widthDifference) {
						itemsToShow.push(nextHiddenItem);
						updatedWidthToShow = updatedWidthToShow + childElements[nextHiddenItem].width;
					} else {
						/** If the width to show is greater than the width difference, set the width to show satisfied to true. */
						updatedWidthToShowSatisfied = true;
					}
				}

				/**
				 * If the only item to show is a separator, return.
				 * This is because when we show we want to do it in pairs of (item & separator).
				 * Otherwise we will end up with extra separators or items without separators.
				 */
				if (itemsToShow.length === 1 && itemsToShow[0].startsWith('breadcrumb-separator-')) return;
				/**
				 * If the only item to show is an item, then add the left side separator to the items to show.
				 * This is because when we show we want to do it in pairs of (item & separator).
				 * Otherwise we will end up with items without separators on the left side.
				 */
				if (itemsToShow.length === 1 && itemsToShow[0].startsWith('breadcrumb-item-')) {
					/** Get the index of the item. */
					const index = Number(itemsToShow[0].split('-').pop());
					/** Add the separator to the items to show. */
					itemsToShow.push(`breadcrumb-separator-${index - 1}`);
				}

				/** Set the child elements. */
				setChildElements((prev) => {
					/** Get the updated child elements. */
					const updatedChildElements = { ...prev };
					/** Set the visibility of the items to show to true. */
					itemsToShow.forEach((item) => (updatedChildElements[item].isVisible = true));
					return updatedChildElements;
				});

				return;
			}
		};

		/** Calculate the child element state initially. */
		calculateChildElementState();

		window.addEventListener('resize', calculateChildElementState);
		return (): void => {
			window.removeEventListener('resize', calculateChildElementState);
		};
	}, [childElements, breadcrumbUid, resizeDirection]);

	return (
		<BreadcrumbContext.Provider
			value={{
				breadcrumbUid,
				childElements,
				registerItem,
				setEllipsisWidth,
				popoverProps,
				popoverTriggerProps,
				popoverContentProps,
			}}
		>
			<Container
				as="nav"
				className={cn('w-full overflow-hidden', className)}
				data-slot="breadcrumb"
				data-uid={breadcrumbUid}
				role="navigation"
				{...props}
			>
				<List
					as="ol"
					className={cn('flex w-full items-center text-sm')}
					data-uid={breadcrumbUid}
					{...listProps}
				>
					{children}
				</List>
			</Container>
		</BreadcrumbContext.Provider>
	);
}

/**
 * @name Breadcrumb Item
 * @description Single breadcrumb entry that can render as a navigable link or current-page label and participates in the responsive collapsing logic.
 * @param {BreadcrumbItemPropsType} props - The props for the BreadcrumbItem component.
 * @returns {JSX.Element} The BreadcrumbItem component.
 */
export function BreadcrumbItem({
	href,
	current,
	className,
	children,

	linkProps,
	...props
}: BreadcrumbItemPropsType): JSX.Element {
	const { breadcrumbUid, registerItem, popoverProps, popoverTriggerProps, childElements, popoverContentProps } =
		useContext(BreadcrumbContext);

	/** This item states */
	const [isHidden, setIsHidden] = useState(false);
	const [is2ndItem, setIs2ndItem] = useState(false);
	const [itemHeight, setItemHeight] = useState(0);

	/** This item data id. */
	const itemDataIdRef = useRef<string | undefined>(undefined);

	/** Unique identifier to identify the item element. */
	const breadcrumbItemUid = useId();

	/** Register an item element for responsive collapsing. */
	useEffect(() => {
		const item = document.querySelector(
			`[data-item-uid="${breadcrumbItemUid}"][data-slot="breadcrumb-item"]`,
		) as HTMLElement | null;
		if (!item) return;

		const registeredItem = registerItem(item);
		if (!registeredItem) return;

		itemDataIdRef.current = item.dataset.id;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIs2ndItem(registeredItem.index === 2);

		if (registeredItem.index === 2) {
			/** Set the height of the item, otherwise the ellipsis will not be aligned. */
			setItemHeight(item.offsetHeight);
		}
	}, [registerItem, breadcrumbItemUid]);

	/** Check if the item is currently hidden. */
	useEffect(() => {
		if (!itemDataIdRef.current) return;
		const isVisible = childElements[itemDataIdRef.current]?.isVisible ?? false;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsHidden(!isVisible);
	}, [childElements]);

	/** Component to use for the item. */
	const Component = current ? Container : Link;

	// outline-2 outline-offset-2 outline-transparent focus-visible:outline-primary

	return (
		<>
			<ListItem
				className={cn('inline-flex items-center', isHidden && 'hidden', className)}
				data-slot="breadcrumb-item"
				data-uid={breadcrumbUid}
				data-item-uid={breadcrumbItemUid}
				{...props}
			>
				<Component
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					{...((href && !current ? { href } : {}) as any)}
					variant="wrapper"
					className={cn(
						'px-4 whitespace-nowrap',
						current
							? 'font-semibold'
							: 'text-muted-foreground transition-none outline-none hover:text-primary focus-visible:font-bold focus-visible:text-secondary',
					)}
					aria-current={current ? 'page' : undefined}
					{...linkProps}
				>
					{children}
				</Component>
			</ListItem>

			{/** If the item is the second item and is currently hidden, then show the ellipsis. */}
			{is2ndItem && isHidden && (
				<BreadcrumbEllipsis
					itemHeight={itemHeight}
					popoverProps={popoverProps}
					popoverTriggerProps={popoverTriggerProps}
					popoverContentProps={popoverContentProps}
				/>
			)}
		</>
	);
}

/**
 * @name Breadcrumb Separator
 * @description Visual separator between breadcrumb items that automatically hides when its associated items are collapsed.
 * @param {BreadcrumbSeparatorPropsType} props - The props for the BreadcrumbSeparator component.
 * @returns {JSX.Element} The BreadcrumbSeparator component.
 */
export function BreadcrumbSeparator({
	className,
	children = '/',
	...props
}: BreadcrumbSeparatorPropsType): JSX.Element {
	const { breadcrumbUid, registerItem, childElements } = useContext(BreadcrumbContext);

	/** Whether the separator is hidden. */
	const [isHidden, setIsHidden] = useState(false);

	/** This item data id. */
	const separatorDataIdRef = useRef<string | undefined>(undefined);

	/** Unique identifier to identify the separator element. */
	const separatorUid = useId();

	/** Register an separator element for responsive collapsing. */
	useEffect(() => {
		const separator = document.querySelector(
			`[data-item-uid="${separatorUid}"][data-slot="breadcrumb-separator"]`,
		) as HTMLElement | null;
		if (!separator) return;

		const registeredItem = registerItem(separator);
		if (!registeredItem) return;

		separatorDataIdRef.current = separator.dataset.id;
	}, [registerItem, separatorUid]);

	/** Check if the separator is currently hidden. */
	useEffect(() => {
		if (!separatorDataIdRef.current) return;
		const isVisible = childElements[separatorDataIdRef.current]?.isVisible ?? false;
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsHidden(!isVisible);
	}, [childElements]);

	return (
		<ListItem
			data-slot="breadcrumb-separator"
			data-uid={breadcrumbUid}
			data-item-uid={separatorUid}
			role="presentation"
			aria-hidden="true"
			className={cn(
				'inline-flex items-center text-muted-foreground select-none',
				className,
				isHidden && 'hidden',
			)}
			{...props}
		>
			{children}
		</ListItem>
	);
}

/**
 * @name Breadcrumb Ellipsis
 * @description Ellipsis control that measures its own width and opens a popover listing all breadcrumb items that were hidden during responsive collapsing.
 * @param {BreadcrumbEllipsisPropsType} props - The props for the BreadcrumbEllipsis component.
 * @returns {JSX.Element} The BreadcrumbEllipsis component.
 */
function BreadcrumbEllipsis({
	itemHeight,
	popoverProps,
	popoverTriggerProps,
	popoverContentProps,
}: BreadcrumbEllipsisPropsType): JSX.Element {
	const { childElements, setEllipsisWidth } = useContext(BreadcrumbContext);

	/** Unique identifier to identify the ellipsis element. */
	const ellipsisUid = useId();

	useEffect(() => {
		const ellipsis = document.querySelector(
			`[data-item-uid="${ellipsisUid}"][data-slot="breadcrumb-ellipsis-trigger"]`,
		) as HTMLElement | null;
		if (!ellipsis) return;

		setEllipsisWidth(ellipsis.offsetWidth);
	}, [setEllipsisWidth, ellipsisUid]);

	/** Get the currently hidden items. */
	const hiddenItems = useMemo(
		() =>
			Object.values(childElements)
				.filter((item) => !item.isVisible && item.type === 'item')
				.map((item) => ({ href: item.link, label: item.label })),
		[childElements],
	);

	return (
		<Popover side="bottom" align="center" {...popoverProps}>
			<PopoverTrigger
				variant="wrapper"
				size="icon-sm"
				style={{ height: itemHeight }}
				className={cn('size-auto p-1', hiddenItems.length < 1 && 'hidden')}
				data-item-uid={ellipsisUid}
				aria-label="Show hidden breadcrumb items"
				aria-haspopup="true"
				{...popoverTriggerProps}
			>
				...
			</PopoverTrigger>

			{/* Popover content for the ellipsis that lists all the hidden items. */}
			<PopoverContent className="w-auto min-w-[150px] p-2.5" {...popoverContentProps}>
				<Container as="div" className="flex flex-col gap-1.5" role="list">
					{hiddenItems.map((item, index) => (
						<Link
							key={index}
							href={item.href || ''}
							className="block text-sm text-muted-foreground transition-all hover:text-foreground"
						>
							{item.label}
						</Link>
					))}
				</Container>
			</PopoverContent>
		</Popover>
	);
}
