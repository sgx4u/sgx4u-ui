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
	useId,
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
	baseId: '',
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
 * @description Builds the paired DOM ids that connect a tab trigger with its panel.
 * @param {{ baseId: string; value: string | number }} params - The base id and tab value.
 * @returns {{ triggerId: string; panelId: string }} The trigger and panel ids.
 */
function getTabElementIds({ baseId, value }: { baseId: string; value: string | number }): {
	triggerId: string;
	panelId: string;
} {
	return { triggerId: `${baseId}-tab-${value}`, panelId: `${baseId}-panel-${value}` };
}

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

	/** Stable id used to pair triggers with their panels. */
	const baseId = useId();

	/** Controlled + Uncontrolled sync. */
	const currentValue = value ?? internalValue;

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
				baseId,
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
			<Container {...props} className={cn('w-full', className)} data-slot="tabs" />
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
			underline: 'rounded-t-lg bg-background-light',
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
			outline: 'rounded-md border-2 border-muted',
			underline: 'border-b-2 border-muted',
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
			{...props}
			className={cn(tabListVariants({ variant }), className)}
			data-slot="tab-list"
			role="tablist"
		>
			<Container
				{...tabIndicatorRestProps}
				style={indicatorStyle}
				className={cn(
					tabTriggerVariants({ variant }),
					ready && 'transition-all duration-300 ease-out',
					tabIndicatorClassName,
				)}
				data-slot="tab-indicator"
				aria-hidden="true"
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
	const {
		value: activeValue,
		baseId,
		onValueChange,
		registerTrigger,
		tabTriggerCommonProps,
	} = useContext(TabsContext);

	const isActive = activeValue === value;

	/** Whether any tab is currently selected. */
	const hasSelection = activeValue !== '';

	const { triggerId, panelId } = getTabElementIds({ baseId, value });

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
			variant="ghost"
			{...tabTriggerRestProps}
			{...props}
			ref={(element) => registerTrigger(value, element)}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			className={cn('hover:bg-transparent', tabTriggerClassName, className)}
			id={triggerId}
			data-slot="tab-trigger"
			data-value={value}
			role="tab"
			aria-selected={isActive}
			aria-controls={panelId}
			tabIndex={isActive || !hasSelection ? 0 : -1}
		/>
	);
}

/**
 * @description Tab panel that renders only when its value matches the active tab and links back to its trigger through coordinated ARIA attributes.
 * @returns {JSX.Element} The TabContent component.
 */
export function TabContent({ value, ...props }: TabContentPropsType): JSX.Element {
	const { value: activeValue, baseId, tabContentCommonProps } = useContext(TabsContext);

	const isActive = activeValue === value;

	if (!isActive) return <></>;

	const { triggerId, panelId } = getTabElementIds({ baseId, value });

	return (
		<Container
			{...tabContentCommonProps}
			{...props}
			id={panelId}
			data-slot="tab-content"
			data-value={value}
			role="tabpanel"
			aria-labelledby={triggerId}
		/>
	);
}
