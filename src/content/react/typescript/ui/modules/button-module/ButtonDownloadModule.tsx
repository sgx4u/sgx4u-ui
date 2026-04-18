'use client';

import { JSX, useEffect, useRef } from 'react';
import { CheckIcon, DownloadIcon } from 'lucide-react';

import { ButtonDownloadModulePropsType } from './button-module.type';
import { cn } from '../../utils/styles.util';

import { Button } from '../../elements/button';
import { Container } from '../../elements/container';
import { SpinLoader } from '../../elements/loader';

const commonIconClassName = 'absolute inset-0 m-auto hidden size-full';

/**
 * @description A button module that shows a spinner while copying, a check icon after success, then returns to the copy icon.
 * @param {ButtonDownloadModulePropsType} props - The props for the ButtonDownloadModule component.
 * @returns {JSX.Element} The ButtonDownloadModule component.
 */
export function ButtonDownloadModule({
	isDownloading,
	iconClassName,

	children,
	...props
}: ButtonDownloadModulePropsType): JSX.Element {
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!buttonRef.current) return;

		if (isDownloading) buttonRef.current.dataset.download = 'downloading';
		else {
			setTimeout(() => (buttonRef.current!.dataset.download = 'downloaded'), 500);
			setTimeout(() => (buttonRef.current!.dataset.download = 'idle'), 1000);
		}
	}, [isDownloading]);

	return (
		<Button ref={buttonRef} {...props} className={cn('group', props.className)} data-download="idle">
			<Container as="span" className="relative size-4">
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
