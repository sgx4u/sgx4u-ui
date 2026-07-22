import { JSX } from 'react';

import {
	CardContentPropsType,
	CardDescriptionPropsType,
	CardFooterPropsType,
	CardPropsType,
	CardTitlePropsType,
} from './card.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';
import { Text } from '../text';

/** Card variants. */
export const { variants: cardVariants, types: CardVariantTypes } = makeVariants({
	base: 'relative flex flex-col text-wrap',
	variants: {
		variant: {
			default: 'shadow-md',

			outline: 'border shadow-none',

			glass: 'bg-background/30 shadow-lg ring-1 ring-border/40 backdrop-blur-xl supports-backdrop-filter:bg-background/20',

			liquid: 'bg-background/50 shadow-xl ring-1 ring-border/30 backdrop-blur-md before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(120%_120%_at_10%_0%,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.08)_45%,rgba(255,255,255,0)_70%)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[radial-gradient(120%_120%_at_90%_100%,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.06)_40%,rgba(255,255,255,0)_70%)]',
		},
		size: {
			xs: 'p-1 mobile:p-3 laptop:p-4',
			sm: 'p-2 mobile:p-4 laptop:p-5',
			default: 'p-3 mobile:p-5 laptop:p-6',
			lg: 'p-4 mobile:p-6 laptop:p-8',
			xl: 'p-5 mobile:p-7 laptop:p-9',
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
		variant: 'default',
		size: 'default',
		radius: 'lg',
	},
});

/**
 * @description Layout wrapper used to display content in a card format.
 * @returns {JSX.Element} The Card component.
 */
export function Card({
	variant = 'default',
	size = 'default',
	radius = 'lg',
	className,
	children,

	...props
}: CardPropsType): JSX.Element {
	return (
		<Container className={cn(cardVariants({ variant, size, radius }), className)} data-slot="card" {...props}>
			{children}
		</Container>
	);
}

/**
 * @description Title wrapper used to display content in a card format.
 * @returns {JSX.Element} The CardTitle component.
 */
export function CardTitle({ as = 'h6', ...props }: CardTitlePropsType): JSX.Element {
	return <Text as={as} data-slot="card-title" {...props} />;
}

/**
 * @description Description wrapper used to display content in a card format.
 * @returns {JSX.Element} The CardDescription component.
 */
export function CardDescription({ className, ...props }: CardDescriptionPropsType): JSX.Element {
	return (
		<Text
			data-slot="card-description"
			className={cn('scroll-mt-0.5 font-medium text-muted-foreground', className)}
			{...props}
		/>
	);
}

/**
 * @description Content wrapper used to display content in a card format.
 * @returns {JSX.Element} The CardContent component.
 */
export function CardContent({ className, ...props }: CardContentPropsType): JSX.Element {
	return (
		<Container
			className={cn('mt-3 flex flex-col gap-2 pt-2 pb-4', className)}
			data-slot="card-content"
			{...props}
		/>
	);
}

/**
 * @description Footer wrapper used to display content in a card format.
 * @returns {JSX.Element} The CardFooter component.
 */
export function CardFooter({ className, ...props }: CardFooterPropsType): JSX.Element {
	return <Container className={cn('mt-auto flex justify-end gap-2', className)} data-slot="card-footer" {...props} />;
}
