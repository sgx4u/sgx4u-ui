'use client';

import { JSX, MouseEvent, useEffect, useRef } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';

import { ButtonCopyModulePropsType } from './button-module.type';
import { cn } from '../../utils/styles.util';

import { Button } from '../../elements/button';
import { Container } from '../../elements/container';
import { SpinLoader } from '../../elements/loader';

/** Class name shared by the stacked copy status icons. */
const commonIconClassName = 'absolute inset-0 m-auto hidden size-full';

/**
 * @description Button that copies a value to the clipboard and cycles through pending and success icon states.
 * @param {ButtonCopyModulePropsType} props - The props for the ButtonCopyModule component.
 * @returns {JSX.Element} The ButtonCopyModule component.
 */
export function ButtonCopyModule({
	valueToCopy,
	onClick,

	iconClassName,
	className,
	children,
	...props
}: ButtonCopyModulePropsType): JSX.Element {
	const timeoutIdsRef = useRef<Array<number>>([]);

	/** Clears any pending copy feedback timeouts. */
	const clearFeedbackTimeouts = (): void => {
		timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
		timeoutIdsRef.current = [];
	};

	/**
	 * @description Copies the configured value and runs the status feedback cycle.
	 * @param {MouseEvent<HTMLButtonElement>} event - The click event from the button.
	 * @returns {Promise<void>}
	 */
	const handleCopy = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
		onClick?.(event);
		if (event.defaultPrevented || !valueToCopy) return;

		const button = event.currentTarget;
		if (button.dataset.copy === 'copying') return;

		clearFeedbackTimeouts();
		button.dataset.copy = 'copying';

		try {
			await navigator.clipboard.writeText(valueToCopy);

			timeoutIdsRef.current = [
				window.setTimeout(() => (button.dataset.copy = 'copied'), 500),
				window.setTimeout(() => (button.dataset.copy = 'idle'), 1000),
			];
		} catch (error) {
			button.dataset.copy = 'idle';
			console.error('ButtonCopyModule failed to copy value to the clipboard.', error);
		}
	};

	/** Clears any pending copy feedback timeouts on unmount. */
	useEffect(() => {
		return (): void => clearFeedbackTimeouts();
	}, []);

	return (
		<Button {...props} onClick={handleCopy} className={cn('group', className)} data-copy="idle">
			<Container as="span" className="relative size-4" aria-hidden="true">
				<CopyIcon className={cn(commonIconClassName, 'group-data-[copy=idle]:inline', iconClassName)} />
				<SpinLoader className={cn(commonIconClassName, 'group-data-[copy=copying]:inline', iconClassName)} />
				<CheckIcon className={cn(commonIconClassName, 'group-data-[copy=copied]:inline', iconClassName)} />
			</Container>

			{children}
		</Button>
	);
}
