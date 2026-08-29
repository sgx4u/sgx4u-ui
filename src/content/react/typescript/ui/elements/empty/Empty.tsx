import { JSX } from 'react';

import {
	EmptyActionPropsType,
	EmptyDescriptionPropsType,
	EmptyIconPropsType,
	EmptyPropsType,
	EmptyTitlePropsType,
} from './empty.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container';
import { Text } from '../text';

/**
 * @description Placeholder for lists, tables, or pages with no content to display.
 * @returns {JSX.Element} The Empty component.
 */
export function Empty({ className, ...props }: EmptyPropsType): JSX.Element {
	return (
		<Container
			className={cn('flex flex-col items-center gap-1 px-6 py-12 text-center', className)}
			data-slot="empty"
			{...props}
		/>
	);
}

/**
 * @description Icon wrapper for the Empty component, styled to sit above the title.
 * @returns {JSX.Element} The EmptyIcon component.
 */
export function EmptyIcon({ className, ...props }: EmptyIconPropsType): JSX.Element {
	return (
		<Container
			className={cn(
				'mb-2 flex size-12 items-center justify-center rounded-full bg-muted-light text-muted-foreground [&_svg]:size-6',
				className,
			)}
			data-slot="empty-icon"
			aria-hidden="true"
			{...props}
		/>
	);
}

/**
 * @description Title for the Empty component.
 * @returns {JSX.Element} The EmptyTitle component.
 */
export function EmptyTitle({ className, ...props }: EmptyTitlePropsType): JSX.Element {
	return <Text as="subtitle" className={cn('font-bold', className)} data-slot="empty-title" {...props} />;
}

/**
 * @description Supporting description for the Empty component.
 * @returns {JSX.Element} The EmptyDescription component.
 */
export function EmptyDescription({ className, ...props }: EmptyDescriptionPropsType): JSX.Element {
	return (
		<Text
			as="body-small"
			variant="muted"
			className={cn('max-w-sm', className)}
			data-slot="empty-description"
			{...props}
		/>
	);
}

/**
 * @description Action slot for the Empty component, typically hosting a Button.
 * @returns {JSX.Element} The EmptyAction component.
 */
export function EmptyAction({ className, ...props }: EmptyActionPropsType): JSX.Element {
	return <Container className={cn('mt-4 flex items-center gap-2', className)} data-slot="empty-action" {...props} />;
}
