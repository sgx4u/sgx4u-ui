import { JSX } from 'react';

import { SeparatorPropsType } from './separator.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container/Container';

/** Variants for the Separator component. */
export const { variants: separatorVariants, types: SeparatorVariantTypes } = makeVariants({
	base: 'inline-block shrink-0',
	variants: {
		variant: {
			default: 'bg-border',
			dashed: 'text-border',
			gradient: 'from-transparent via-border to-transparent',
		},
		orientation: {
			vertical: '',
			horizontal: '',
		},
		thickness: {
			thin: '',
			default: '',
			thick: '',
		},
	},
	conditionals: [
		{ when: { orientation: 'vertical', thickness: 'thin' }, apply: 'h-full min-h-3 w-px' },
		{ when: { orientation: 'vertical', thickness: 'default' }, apply: 'h-full min-h-3 w-0.5' },
		{ when: { orientation: 'vertical', thickness: 'thick' }, apply: 'h-full min-h-3 w-0.75' },
		{ when: { orientation: 'horizontal', thickness: 'thin' }, apply: 'h-px w-full min-w-3' },
		{ when: { orientation: 'horizontal', thickness: 'default' }, apply: 'h-0.5 w-full min-w-3' },
		{ when: { orientation: 'horizontal', thickness: 'thick' }, apply: 'h-0.75 w-full min-w-3' },
		{ when: { variant: 'gradient', orientation: 'horizontal' }, apply: 'bg-linear-to-r' },
		{ when: { variant: 'gradient', orientation: 'vertical' }, apply: 'bg-linear-to-b' },
		{
			when: { variant: 'dashed', orientation: 'horizontal' },
			apply: '[background:repeating-linear-gradient(to_right,currentColor_0,currentColor_8px,transparent_8px,transparent_16px)]',
		},
		{
			when: { variant: 'dashed', orientation: 'vertical' },
			apply: '[background:repeating-linear-gradient(to_bottom,currentColor_0,currentColor_8px,transparent_8px,transparent_16px)]',
		},
	],
	default: {
		variant: 'default',
		thickness: 'default',
	},
});

/**
 * @description Thin rule used to visually divide groups of content or UI controls.
 * @returns {JSX.Element} The Separator component.
 */
export function Separator({
	orientation = 'horizontal',
	decorative = false,

	variant = 'default',
	thickness = 'default',
	className,

	...props
}: SeparatorPropsType): JSX.Element {
	return (
		<Container
			as="span"
			data-slot="separator"
			className={cn(separatorVariants({ variant, thickness, orientation }), className)}
			{...props}
			role={decorative ? 'presentation' : 'separator'}
			aria-orientation={decorative ? undefined : orientation}
		/>
	);
}
