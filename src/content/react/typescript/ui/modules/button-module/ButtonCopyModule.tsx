'use client';

import { JSX, MouseEvent } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';

import { ButtonCopyModulePropsType } from './button-module.type';
import { cn } from '../../utils/styles.util';

import { Button } from '../../elements/button';
import { Container } from '../../elements/container';
import { SpinLoader } from '../../elements/loader';

const commonIconClassName = 'absolute inset-0 m-auto hidden size-full';

/**
 * @description A button module that shows a spinner while copying, a check icon after success, then returns to the copy icon.
 * @param {ButtonCopyModulePropsType} props - The props for the ButtonCopyModule component.
 * @returns {JSX.Element} The ButtonCopyModule component.
 */
export function ButtonCopyModule({
	valueToCopy,
	onClick,
	iconClassName,

	children,
	...props
}: ButtonCopyModulePropsType): JSX.Element {
	const onCopy = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
		onClick?.(event);
		if (!valueToCopy) return;

		const element = event.currentTarget;
		const currentButtonCopyState = element.dataset.copy;
		if (currentButtonCopyState === 'copying') return;

		element.dataset.copy = 'copying';
		await navigator.clipboard.writeText(valueToCopy);

		setTimeout(() => (element.dataset.copy = 'copied'), 500);
		setTimeout(() => (element.dataset.copy = 'idle'), 1000);
	};

	return (
		<Button {...props} onClick={onCopy} className={cn('group', props.className)} data-copy="idle">
			<Container as="span" className="relative size-4">
				<CopyIcon className={cn(commonIconClassName, 'group-data-[copy=idle]:inline', iconClassName)} />
				<SpinLoader className={cn(commonIconClassName, 'group-data-[copy=copying]:inline', iconClassName)} />
				<CheckIcon className={cn(commonIconClassName, 'group-data-[copy=copied]:inline', iconClassName)} />
			</Container>

			{children}
		</Button>
	);
}
