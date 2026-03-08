import { JSX } from 'react';

import { SkeletonPropsType } from './skeleton.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';

/** Variants for the Skeleton component. */
export const { variants: skeletonVariants, types: SkeletonVariantTypes } = makeVariants({
	base: 'bg-muted',
	variants: {
		variant: {
			circular: 'size-10 rounded-full',
			square: 'size-10 rounded-md',
			rectangular: 'h-10 w-20 rounded-md',
		},
		animation: {
			pulse: 'animate-pulse',
			wave: 'animate-wave-bg',
			none: 'animate-none',
		},
	},
	default: {
		variant: 'circular',
		animation: 'wave',
	},
});

/**
 * @description Placeholder UI used to represent content that is still loading.
 * @returns {JSX.Element} The Skeleton component.
 */
export function Skeleton({
	variant = 'circular',
	animation = 'wave',
	className,

	...props
}: SkeletonPropsType): JSX.Element {
	const isHidden = props['aria-hidden'] ?? true;

	return (
		<Container
			as="div"
			className={cn(skeletonVariants({ variant, animation }), className)}
			data-slot="skeleton"
			role={isHidden ? undefined : 'status'}
			aria-busy={isHidden ? undefined : 'true'}
			aria-label={isHidden ? undefined : (props['aria-label'] ?? props.title ?? 'Loading content.')}
			{...props}
		/>
	);
}
