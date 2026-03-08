'use client';

import { cloneElement, HTMLAttributes, isValidElement, JSX } from 'react';

import { cn } from '../../utils/styles.util';

/**
 * @description Merges two event handler functions of the same type into a single composed handler. Both handlers are called in order: child handler first, then the parent slot handler.
 * @template TEvent
 * @param {((event: TEvent) => void) | undefined} childHandler - The child element's existing handler.
 * @param {((event: TEvent) => void) | undefined} slotHandler - The slot's handler to compose in.
 * @returns {((event: TEvent) => void) | undefined} A composed handler, or whichever single handler exists.
 */
function mergeEventHandlers<TEvent>(
	childHandler: ((event: TEvent) => void) | undefined,
	slotHandler: ((event: TEvent) => void) | undefined,
): ((event: TEvent) => void) | undefined {
	if (!childHandler && !slotHandler) return undefined;
	if (!childHandler) return slotHandler;
	if (!slotHandler) return childHandler;

	return (event: TEvent): void => {
		childHandler(event);
		slotHandler(event);
	};
}

/**
 * @description Detects whether a prop key is an event handler (starts with 'on' followed by an uppercase letter) so it can be composed rather than overwritten.
 * @param {string} key - The prop key to test.
 * @returns {boolean} True if the key is a React event handler prop.
 */
function isEventHandlerProp(key: string): boolean {
	return key.startsWith('on') && key.length > 2 && key[2] === key[2].toUpperCase();
}

/**
 * @description Composition utility that lets components render their children as the actual DOM element while still receiving styling and behavior. All event handlers from both the Slot and the child are composed so neither is silently dropped.
 * @returns {JSX.Element} The Slot component.
 */
export function Slot({ children, className, ...slotProps }: HTMLAttributes<HTMLElement>): JSX.Element {
	if (!isValidElement(children)) return <>{children}</>;

	const childProps = children.props as HTMLAttributes<HTMLElement>;

	/** Build the merged props object, composing every event handler from both sides. */
	const mergedProps: Record<string, unknown> = { ...childProps, ...slotProps };

	/** Iterate over all slot props and compose event handlers found in both sources. */
	for (const key of Object.keys(slotProps)) {
		if (!isEventHandlerProp(key)) continue;

		const slotHandler = (slotProps as Record<string, unknown>)[key] as ((event: unknown) => void) | undefined;
		const childHandler = (childProps as Record<string, unknown>)[key] as ((event: unknown) => void) | undefined;

		mergedProps[key] = mergeEventHandlers(childHandler, slotHandler);
	}

	/** className is always merged via cn rather than overwritten. */
	mergedProps['className'] = cn(childProps.className, className);

	return cloneElement(children, mergedProps as HTMLAttributes<HTMLElement>);
}
