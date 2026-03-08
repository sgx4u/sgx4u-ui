'use client';

import {
	createContext,
	CSSProperties,
	JSX,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent as ReactMouseEvent,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';

import {
	TabContentPropsType,
	TabListPropsType,
	TabsContextType,
	TabsPropsType,
	TabTriggerPropsType,
} from './tabs.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';
import { tabsOnKeyDownHelper } from './tabs-keydown.helper';

import { Button } from '../button';
import { Container } from '../container';

/** Context for the Tabs component. */
const TabsContext = createContext<TabsContextType>({
	value: '',
	onValueChange: () => {},
	registerTrigger: () => {},
	getTriggerElement: () => null,
	getFirstTriggerValue: () => null,
	variant: 'default',
	tabTriggerCommonProps: {},
	tabContentCommonProps: {},
	tabIndicatorProps: {},
});

/**
 * @description A set of stacked triggers that switch between different views or panels in the same space.
 * @returns {JSX.Element} The Tabs component.
 */
export function Tabs({
	value,
	defaultValue,
	onValueChange,
	disableDefaultSelection = false,

	variant = 'default',
	className,

	tabTriggerCommonProps,
	tabContentCommonProps,
	tabIndicatorProps,
	...props
}: TabsPropsType): JSX.Element {
	/** Internal value state when value is not provided. */
	const [internalValue, setInternalValue] = useState(defaultValue ?? '');

	/** Controlled + Uncontrolled sync. */
	const currentValue = value ?? internalValue;

	/** Ref to store the trigger elements. */
	const triggerElementsRef = useRef<Map<string | number, HTMLButtonElement>>(new Map());

	const registerTrigger = (tabValue: string | number, element: HTMLButtonElement | null): void => {
		if (!element) triggerElementsRef.current.delete(tabValue);
		else triggerElementsRef.current.set(tabValue, element);
	};

	const getTriggerElement = (tabValue: string | number): HTMLButtonElement | null => {
		return triggerElementsRef.current.get(tabValue) ?? null;
	};

	const getFirstTriggerValue = (): string | number | null => {
		const iterator = triggerElementsRef.current.keys();
		const first = iterator.next();
		return first.done ? null : first.value;
	};

	const handleValueChange = useCallback(
		(newValue: string | number): void => {
			onValueChange?.(newValue);
			if (value === undefined) setInternalValue(newValue);
		},
		[onValueChange, value],
	);

	/** Auto-select first tab if nothing was provided and default selection is not disabled. */
	useEffect(() => {
		if (disableDefaultSelection || currentValue) return;

		const firstValue = getFirstTriggerValue();
		if (firstValue === null) return;

		// eslint-disable-next-line react-hooks/set-state-in-effect
		handleValueChange(firstValue);
	}, [currentValue, disableDefaultSelection, handleValueChange]);

	return (
		<TabsContext.Provider
			value={{
				value: currentValue,
				onValueChange: handleValueChange,
				registerTrigger,
				getTriggerElement,
				getFirstTriggerValue,
				variant,
				tabTriggerCommonProps,
				tabContentCommonProps,
				tabIndicatorProps,
			}}
		>
			<Container as="div" className={cn('w-full', className)} data-slot="tabs" {...props} />
		</TabsContext.Provider>
	);
}

/** Variants for the Tab List component. */
export const { variants: tabListVariants, types: TabListVariantTypes } = makeVariants({
	base: 'group/tab-list relative flex w-max gap-2',
	variants: {
		variant: {
			default: 'rounded-lg bg-background-light',
			outline: '',
			underline: '',
		},
	},
	default: {
		variant: 'default',
	},
});

/** Variants for the Tab Trigger component. */
export const { variants: tabTriggerVariants, types: TabTriggerVariantTypes } = makeVariants({
	base: 'absolute',
	variants: {
		variant: {
			default: 'rounded-md bg-muted',
			outline: 'rounded-md border',
			underline: 'border-b-2 border-border',
		},
	},
	default: {
		variant: 'default',
	},
});

/**
 * @description Container for tab triggers that renders a sliding indicator bar sized and positioned via layout measurements of the active tab.
 * @returns {JSX.Element} The TabList component.
 */
export function TabList({
	className,

	children,

	...props
}: TabListPropsType): JSX.Element {
	const { value, getTriggerElement, variant, tabIndicatorProps } = useContext(TabsContext);

	const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({});
	const [ready, setReady] = useState(false);

	/** Compute indicator style AFTER layout is ready. */
	useLayoutEffect(() => {
		const activeTrigger = getTriggerElement(value);
		if (!activeTrigger) return;

		/** Get the bounding client rect of the active trigger and its parent. */
		const rect = activeTrigger.getBoundingClientRect();
		const parentRect = activeTrigger.parentElement?.getBoundingClientRect();

		if (!parentRect) return;

		/** Compute relative position. */
		const inlineTranslation = rect.left - parentRect.left;
		const blockTranslation = rect.top - parentRect.top;

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIndicatorStyle({
			inlineSize: `${activeTrigger.offsetWidth}px`,
			blockSize: `${activeTrigger.offsetHeight}px`,
			transform: `translate(${inlineTranslation}px, ${blockTranslation}px)`,
		});

		/** Enable transitions after initial position is set. */
		setTimeout(() => setReady(true), 0);
	}, [value, getTriggerElement]);

	const { className: tabIndicatorClassName, ...tabIndicatorRestProps } = tabIndicatorProps ?? {};

	return (
		<Container
			as="div"
			className={cn(tabListVariants({ variant }), className)}
			data-slot="tab-list"
			role="tablist"
			{...props}
		>
			<Container
				as="div"
				style={indicatorStyle}
				className={cn(
					tabTriggerVariants({ variant }),
					ready && 'transition-all duration-300 ease-out',
					tabIndicatorClassName,
				)}
				data-slot="tab-indicator"
				aria-hidden="true"
				{...tabIndicatorRestProps}
			/>
			{children}
		</Container>
	);
}

/**
 * @description Button-like tab trigger that updates the active tab value on click and wires ARIA attributes to its associated content panel.
 * @returns {JSX.Element} The TabTrigger component.
 */
export function TabTrigger({ value, onClick, onKeyDown, className, ...props }: TabTriggerPropsType): JSX.Element {
	const { value: activeValue, onValueChange, registerTrigger, tabTriggerCommonProps } = useContext(TabsContext);

	/** Whether this tab is active. */
	const isActive = activeValue === value;

	const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		onValueChange(value);
		onClick?.(event);
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		onKeyDown?.(event);
		tabsOnKeyDownHelper(event);
	};

	const { className: tabTriggerClassName, ...tabTriggerRestProps } = tabTriggerCommonProps ?? {};

	return (
		<Button
			ref={(element) => registerTrigger(value, element)}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			variant="ghost"
			className={cn('hover:bg-transparent', tabTriggerClassName, className)}
			data-slot="tab-trigger"
			data-value={value}
			role="tab"
			aria-selected={isActive}
			aria-controls={`panel-${value}`}
			{...tabTriggerRestProps}
			{...props}
		/>
	);
}

/**
 * @description Tab panel that renders only when its value matches the active tab and links back to its trigger through coordinated ARIA attributes.
 * @returns {JSX.Element} The TabContent component.
 */
export function TabContent({ value, ...props }: TabContentPropsType): JSX.Element {
	const { value: activeValue, tabContentCommonProps } = useContext(TabsContext);

	/** Whether this tab content is active. */
	const isActive = activeValue === value;

	if (!isActive) return <></>;
	return (
		<Container
			as="div"
			data-slot="tab-content"
			data-value={value}
			role="tabpanel"
			hidden={!isActive}
			{...tabContentCommonProps}
			{...props}
		/>
	);
}
