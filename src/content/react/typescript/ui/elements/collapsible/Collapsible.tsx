'use client';

import { createContext, JSX, useCallback, useContext, useRef, useState } from 'react';

import {
	CollapsibleContentPropsType,
	CollapsibleContextType,
	CollapsiblePropsType,
	CollapsibleTriggerPropsType,
} from './collapsible.type';
import { cn } from '../../utils/styles.util';
import { slidePanel } from '../../helpers/slide-panel.helper';

import { useReducedMotion } from '../../hooks/useReducedMotion.hook';

import { Button } from '../button';
import { Container } from '../container';

const CollapsibleContext = createContext<CollapsibleContextType>({
	open: false,
	onToggle: () => {},
	registerContent: () => {},
});

/**
 * @description Accesses the current collapsible context, guarding against usage outside a Collapsible.
 * @returns {CollapsibleContextType} The current collapsible context.
 */
function useCollapsibleContext(): CollapsibleContextType {
	return useContext(CollapsibleContext);
}

/**
 * @description A single section that can be expanded or collapsed to reveal or hide content, without the exclusivity rules of Accordion.
 * @returns {JSX.Element} The Collapsible component.
 */
export function Collapsible({
	open,
	defaultOpen = false,
	onOpenChange,

	speed = 150,
	className,

	...props
}: CollapsiblePropsType): JSX.Element {
	const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);

	const prefersReducedMotion = useReducedMotion();

	const currentOpen = open ?? internalOpen;
	const contentElementRef = useRef<HTMLElement | null>(null);

	const registerContent = useCallback((element: HTMLElement | null): void => {
		contentElementRef.current = element;
	}, []);

	const onToggle = (): void => {
		const nextOpen = !currentOpen;

		onOpenChange?.(nextOpen);
		if (open === undefined) setInternalOpen(nextOpen);

		if (!contentElementRef.current) return;
		const effectiveSpeed = prefersReducedMotion ? 0 : speed;
		slidePanel({ element: contentElementRef.current, speed: effectiveSpeed, action: nextOpen ? 'down' : 'up' });
	};

	return (
		<CollapsibleContext.Provider value={{ open: currentOpen, onToggle, registerContent }}>
			<Container
				className={cn('w-full', className)}
				data-slot="collapsible"
				data-state={currentOpen ? 'open' : 'closed'}
				{...props}
			/>
		</CollapsibleContext.Provider>
	);
}

/**
 * @description Button that toggles the collapsible panel's open state.
 * @returns {JSX.Element} The CollapsibleTrigger component.
 */
export function CollapsibleTrigger({ onClick, variant = 'ghost', ...props }: CollapsibleTriggerPropsType): JSX.Element {
	const { open, onToggle } = useCollapsibleContext();

	return (
		<Button
			onClick={(event) => {
				onClick?.(event);
				onToggle();
			}}
			variant={variant}
			data-slot="collapsible-trigger"
			aria-expanded={open}
			{...props}
		/>
	);
}

/**
 * @description Panel region that animates its height when the collapsible is toggled open or closed.
 * @returns {JSX.Element} The CollapsibleContent component.
 */
export function CollapsibleContent({ className, ...props }: CollapsibleContentPropsType): JSX.Element {
	const { open, registerContent } = useCollapsibleContext();

	return (
		<Container
			ref={registerContent}
			className={cn(open ? 'h-auto overflow-hidden' : 'hidden', className)}
			data-slot="collapsible-content"
			aria-hidden={!open}
			{...props}
		/>
	);
}
