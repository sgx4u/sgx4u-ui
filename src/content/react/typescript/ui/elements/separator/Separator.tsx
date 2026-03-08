import { JSX } from 'react';

import { SeparatorPropsType } from './separator.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container/Container';

/** Variants for the Separator component. */
export const { variants: separatorVariants, types: SeparatorVariantTypes } = makeVariants({
	base: 'inline-block shrink-0 bg-border',
	variants: {
		variant: {
			default: '',
			dashed: 'text-border [background:repeating-linear-gradient(to_right,currentColor_0,currentColor_8px,transparent_8px,transparent_16px)]',
			gradient: 'bg-linear-to-r from-transparent via-border to-transparent transition-all',
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
		{ when: { orientation: 'vertical', thickness: 'thick' }, apply: 'h-full min-h-3 w-[3px]' },
		{ when: { orientation: 'horizontal', thickness: 'thin' }, apply: 'h-px w-full min-w-3' },
		{ when: { orientation: 'horizontal', thickness: 'default' }, apply: 'h-0.5 w-full min-w-3' },
		{ when: { orientation: 'horizontal', thickness: 'thick' }, apply: 'h-[3px] w-full min-w-3' },
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

	variant = 'default',
	thickness = 'default',
	className,

	...props
}: SeparatorPropsType): JSX.Element {
	return (
		<Container
			as="span"
			data-slot="separator"
			role="separator"
			aria-orientation={orientation}
			className={cn(separatorVariants({ variant, thickness, orientation }), className)}
			{...props}
		/>
	);
}
