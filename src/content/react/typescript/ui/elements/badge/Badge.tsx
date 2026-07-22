import { JSX } from 'react';

import { BadgePropsType } from './badge.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';

/** Variants for the Badge component. */
export const { variants: badgeVariants, types: BadgeVariantTypes } = makeVariants({
	base: `inline-flex shrink-0 items-center justify-center gap-1 text-xs font-semibold whitespace-nowrap outline-2 outline-offset-2 outline-transparent transition-colors focus-visible:outline-primary aria-invalid:outline-danger/25 [&_svg:not([class*='size-'])]:size-3`,
	variants: {
		variant: {
			primary: `bg-primary text-primary-foreground`,
			'primary-light': `bg-primary-light text-primary`,
			'primary-outline': `border-2 border-primary bg-background text-primary`,

			secondary: `bg-secondary text-secondary-foreground`,
			'secondary-light': `bg-secondary-light text-secondary`,
			'secondary-outline': `border-2 border-secondary bg-background text-secondary`,

			success: `bg-success text-success-foreground`,
			'success-light': `bg-success-light text-success`,
			'success-outline': `border-2 border-success bg-background text-success`,

			warn: `bg-warn text-warn-foreground`,
			'warn-light': `bg-warn-light text-warn`,
			'warn-outline': `border-2 border-warn bg-background text-warn`,

			danger: `bg-danger text-danger-foreground`,
			'danger-light': `bg-danger-light text-danger`,
			'danger-outline': `border-2 border-danger bg-background text-danger`,

			muted: `bg-muted-light text-muted-foreground`,
			'muted-light': `bg-muted-light text-muted-foreground`,
			'muted-outline': `border-2 border-muted bg-background text-muted-dark`,

			outline: `border-2 bg-background text-muted-foreground`,
		},
		size: {
			sm: 'h-4.5 px-2',
			default: 'h-5 px-2.5',
			lg: 'h-5.5 px-3',
			'status-sm': 'size-2 text-xs',
			status: 'size-3 text-xs',
			'status-lg': 'size-4 text-xs',
		},
		radius: {
			none: 'rounded-none',
			sm: 'rounded-sm',
			md: 'rounded-md',
			lg: 'rounded-lg',
			xl: 'rounded-xl',
			'2xl': 'rounded-2xl',
			'3xl': 'rounded-3xl',
			'4xl': 'rounded-4xl',
			full: 'rounded-full',
		},
	},
	default: {
		variant: 'primary',
		size: 'default',
		radius: 'full',
	},
});

/**
 * @description Compact label used to display counts, statuses, or short pieces of metadata.
 * @returns {JSX.Element} The Badge component.
 */
export function Badge({
	status,

	variant = 'primary',
	size = 'default',
	radius = 'full',
	className,

	role,
	...props
}: BadgePropsType): JSX.Element {
	/** Infer role="status" for status badges (implies aria-live="polite"); respect an explicit role otherwise. */
	const inferredRole = role ?? (status ? 'status' : undefined);

	return (
		<Container
			as="span"
			className={cn(badgeVariants({ variant, size, radius }), className)}
			data-slot="badge"
			role={inferredRole}
			data-status={status ? 'true' : undefined}
			{...props}
		/>
	);
}
