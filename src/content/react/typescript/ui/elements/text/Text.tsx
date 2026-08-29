import { createElement, JSX } from 'react';

import { TextPropsType } from './text.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Slot } from '../slot/Slot';

/** Variants for the Text component. */
export const { variants: textVariants, types: TextVariantTypes } = makeVariants({
	base: 'h-max',
	variants: {
		as: {
			/** Text tags. */
			h1: `text-4xl font-bold tablet:text-[40px] laptop:text-5xl`,
			h2: `text-3xl font-bold tablet:text-[36px] laptop:text-4xl`,
			h3: `text-2xl font-bold tablet:text-[28px] laptop:text-3xl`,
			h4: `text-xl font-bold tablet:text-[24px] laptop:text-2xl`,
			h5: `text-lg font-bold laptop:text-xl`,
			h6: `text-base font-bold laptop:text-lg`,
			p: ``,
			span: ``,
			pre: ``,
			code: ``,
			/** Text heading tags. */
			display: `text-4xl font-bold tablet:text-[40px] laptop:text-5xl`,
			heading: `text-3xl font-bold tablet:text-[36px] laptop:text-4xl`,
			subheading: `text-2xl font-semibold tablet:text-[28px] laptop:text-3xl`,
			title: `text-xl font-bold tablet:text-[24px] laptop:text-2xl`,
			subtitle: `text-lg font-semibold laptop:text-xl`,
			/** Text body tags. */
			body: `text-base`,
			'body-small': `text-sm`,
			tag: `text-xs font-semibold tracking-wider uppercase`,
		},
		variant: {
			default: 'text-foreground',
			secondary: 'text-secondary',
			success: 'text-success',
			warn: 'text-warn',
			danger: 'text-danger',
			muted: 'text-muted-foreground',
		},
	},
	default: {
		as: 'body',
	},
});

const textTags: Record<typeof TextVariantTypes.as, keyof JSX.IntrinsicElements> = {
	/** Text tags. */
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	h5: 'h5',
	h6: 'h6',
	p: 'p',
	span: 'span',
	pre: 'pre',
	code: 'code',
	/** Text heading tags. */
	display: 'h1',
	heading: 'h2',
	subheading: 'h3',
	title: 'h4',
	subtitle: 'h5',
	/** Text body tags. */
	body: 'p',
	'body-small': 'p',
	tag: 'p',
};

/**
 * @description Typography primitive for rendering semantic headings, paragraphs, and inline text.
 * @returns {JSX.Element} The Text component.
 */
export function Text({
	asChild,
	as = 'body',
	variant = undefined,

	className,

	children,
	...props
}: TextPropsType): JSX.Element {
	const tagName = textTags[as] ?? 'p';

	const componentProps = {
		className: cn(textVariants({ as, variant }), className),
		'data-slot': 'text',
		...props,
	} as const;

	/** If asChild is true, merge props with the child element (no new DOM node). */
	if (asChild) return <Slot {...componentProps}>{children}</Slot>;

	return createElement(tagName, componentProps, children);
}
