'use client';

import { JSX, useEffect, useRef } from 'react';
import { CheckIcon, DownloadIcon } from 'lucide-react';

import { ButtonDownloadModulePropsType } from './button-module.type';
import { cn } from '../../utils/styles.util';

import { Button } from '../../elements/button';
import { Container } from '../../elements/container';
import { SpinLoader } from '../../elements/loader';

/** Class name shared by the stacked download status icons. */
const commonIconClassName = 'absolute inset-0 m-auto hidden size-full';

/**
 * @description Button that reflects an external download lifecycle with pending and success icon states.
 * @param {ButtonDownloadModulePropsType} props - The props for the ButtonDownloadModule component.
 * @returns {JSX.Element} The ButtonDownloadModule component.
 */
export function ButtonDownloadModule({
	isDownloading = false,
	iconClassName,
	className,
	ref,
	disabled,
	children,
	...props
}: ButtonDownloadModulePropsType): JSX.Element {
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const timeoutIdsRef = useRef<Array<number>>([]);
	const wasDownloadingRef = useRef(false);

	/** Clears any pending download feedback timeouts. */
	const clearFeedbackTimeouts = (): void => {
		timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
		timeoutIdsRef.current = [];
	};

	/**
	 * @description Composes the internal button ref with an optional consumer ref.
	 * @param {HTMLButtonElement | null} node - The mounted button element, or null on unmount.
	 * @returns {void}
	 */
	const setButtonRef = (node: HTMLButtonElement | null): void => {
		buttonRef.current = node;

		if (typeof ref === 'function') {
			ref(node);
			return;
		}

		if (ref) ref.current = node;
	};

	/** Runs the download feedback cycle. */
	useEffect(() => {
		const button = buttonRef.current;
		if (!button) return;

		clearFeedbackTimeouts();

		if (isDownloading) {
			wasDownloadingRef.current = true;
			button.dataset.download = 'downloading';
			return;
		}

		if (!wasDownloadingRef.current) return;

		wasDownloadingRef.current = false;
		timeoutIdsRef.current = [
			window.setTimeout(() => (button.dataset.download = 'downloaded'), 500),
			window.setTimeout(() => (button.dataset.download = 'idle'), 1000),
		];

		return (): void => clearFeedbackTimeouts();
	}, [isDownloading]);

	return (
		<Button
			{...props}
			ref={setButtonRef}
			disabled={disabled || isDownloading}
			aria-busy={isDownloading || undefined}
			className={cn('group', className)}
			data-download="idle"
		>
			<Container as="span" className="relative size-4" aria-hidden="true">
				<DownloadIcon className={cn(commonIconClassName, 'group-data-[download=idle]:inline', iconClassName)} />
				<SpinLoader
					className={cn(commonIconClassName, 'group-data-[download=downloading]:inline', iconClassName)}
				/>
				<CheckIcon
					className={cn(commonIconClassName, 'group-data-[download=downloaded]:inline', iconClassName)}
				/>
			</Container>

			{children}
		</Button>
	);
}
