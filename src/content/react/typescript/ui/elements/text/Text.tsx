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
		align: {
			left: `text-left`,
			center: `text-center`,
			right: `text-right`,
			justify: `text-justify`,
		},
		/** Weight is applied via conditionals; no base classes here. */
		weight: {
			light: '',
			normal: '',
			medium: '',
			semibold: '',
			bold: '',
			extrabold: '',
		},
	},
	/** If custom font-weight is passed then we need to overwrite the font weight that is already set in the "as" section. */
	conditionals: [
		{ when: { weight: 'light' }, apply: 'font-light!' },
		{ when: { weight: 'normal' }, apply: 'font-normal!' },
		{ when: { weight: 'medium' }, apply: 'font-medium!' },
		{ when: { weight: 'semibold' }, apply: 'font-semibold!' },
		{ when: { weight: 'bold' }, apply: 'font-bold!' },
		{ when: { weight: 'extrabold' }, apply: 'font-extrabold!' },
	],
	default: {
		as: 'body',
		weight: undefined,
		align: undefined,
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
	weight = undefined,
	align = undefined,
	truncate,
	wrap = true,

	className,

	children,
	...props
}: TextPropsType): JSX.Element {
	/** The final tag name. */
	const tagName = textTags[as as keyof typeof textTags] ?? 'p';

	/** Map aria-level dynamically for screen readers. */
	const ariaLevelMap = {
		h1: 1,
		h2: 2,
		h3: 3,
		h4: 4,
		h5: 5,
		h6: 6,
		display: 1,
		heading: 2,
		subheading: 3,
		title: 4,
		subtitle: 5,
	};
	const ariaLevel = ariaLevelMap[as as keyof typeof ariaLevelMap] ?? undefined;

	const componentProps = {
		className: cn(
			textVariants({ as, weight, align }),
			truncate && 'truncate',
			!wrap && 'whitespace-nowrap',
			className,
		),
		'data-slot': 'text',
		'aria-level': ariaLevel,
		...props,
	} as const;

	/** If asChild is true, merge props with the child element (no new DOM node). */
	if (asChild) return <Slot {...componentProps}>{children}</Slot>;

	/** Create the element dynamically. */
	return createElement(tagName, componentProps, children);
}
