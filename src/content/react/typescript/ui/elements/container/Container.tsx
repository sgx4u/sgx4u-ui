import { createElement, JSX } from 'react';

import { ContainerPropsType } from './container.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Slot } from '../slot';

/** Variants for the Container component. */
export const { variants: containerVariants, types: ContainerVariantTypes } = makeVariants({
	base: '',
	variants: {
		radius: {
			none: 'rounded-none',
			sm: 'rounded-sm',
			md: 'rounded-md',
			lg: 'rounded-lg',
			full: 'rounded-full',
		},
	},
	default: {
		radius: 'none',
	},
});

/**
 * @name Container
 * @description Layout wrapper used to arrange and align content using consistent flex or grid primitives.
 * @returns {JSX.Element} The Container component.
 */
export function Container({
	as = 'div',
	asChild,

	radius,
	className,
	children,

	...props
}: ContainerPropsType): JSX.Element {
	/** Determine default role based on semantic element type and aria attributes. */
	const inferredRole =
		props['role'] ??
		{
			main: 'main',
			nav: 'navigation',
			header: 'banner',
			footer: 'contentinfo',
			aside: 'complementary',
			section: props['aria-label'] || props['aria-labelledby'] ? 'region' : undefined,
			article: 'article',
			span: undefined,
			div: undefined,
		}[as];

	const componentProps = {
		className: cn(containerVariants({ radius }), className),
		'data-slot': 'container',
		role: inferredRole,
		...props,
	} as const;

	/** If asChild is true, merge props with the child element (no new DOM node). */
	if (asChild) return <Slot {...componentProps}>{children}</Slot>;

	/* Avoid createElement for common tags (micro-optimization). */
	if (as === 'div') return <div {...componentProps}>{children}</div>;
	if (as === 'span') return <span {...componentProps}>{children}</span>;
	/** Use createElement to create the element dynamically. */
	return createElement(as, componentProps, children);
}
