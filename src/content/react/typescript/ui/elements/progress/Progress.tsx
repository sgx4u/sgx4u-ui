import { JSX } from 'react';

import { ProgressPropsType } from './progress.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';

/** Size class map for the Progress track. */
const progressSizeClasses = {
	sm: 'h-1.5',
	default: 'h-2',
	lg: 'h-3',
} as const;

/** Fill color class map for the Progress indicator. */
const progressVariantClasses = {
	default: 'bg-primary',
	success: 'bg-success',
	warn: 'bg-warn',
	danger: 'bg-danger',
} as const;

/** Combined size and variant tokens for Progress prop typing. */
export const { types: ProgressVariantTypes } = makeVariants({
	variants: {
		size: progressSizeClasses,
		variant: progressVariantClasses,
	},
	default: {
		size: 'default',
		variant: 'default',
	},
});

/** Track (background bar) variants. */
export const { variants: progressTrackVariants } = makeVariants({
	base: 'w-full overflow-hidden rounded-full bg-muted-light',
	variants: {
		size: progressSizeClasses,
	},
	default: {
		size: 'default',
	},
});

/** Fill (progress indicator) variants. */
export const { variants: progressFillVariants } = makeVariants({
	base: 'h-full rounded-full transition-[width] duration-300 ease-out',
	variants: {
		variant: progressVariantClasses,
	},
	default: {
		variant: 'default',
	},
});

/**
 * @description Horizontal bar that communicates the completion progress of a task.
 * @returns {JSX.Element} The Progress component.
 */
export function Progress({
	value = 0,
	max = 100,
	indeterminate,

	size = 'default',
	variant = 'default',
	className,

	fillProps,
	...props
}: ProgressPropsType): JSX.Element {
	const clampedValue = Math.max(0, Math.min(value, max));
	const percentage = max > 0 ? (clampedValue / max) * 100 : 0;

	return (
		<Container
			className={cn(progressTrackVariants({ size }), className)}
			data-slot="progress"
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={max}
			aria-valuenow={indeterminate ? undefined : clampedValue}
			aria-busy={indeterminate || undefined}
			{...props}
		>
			<Container
				style={indeterminate ? undefined : { width: `${percentage}%` }}
				{...fillProps}
				className={cn(
					progressFillVariants({ variant }),
					indeterminate && 'animate-progress-indeterminate w-1/3',
					fillProps?.className,
				)}
				data-slot="progress-fill"
			/>
		</Container>
	);
}
