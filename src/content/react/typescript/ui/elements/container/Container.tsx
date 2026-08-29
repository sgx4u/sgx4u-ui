import { AriaRole, createElement, JSX } from 'react';

import { ContainerPropsType, ContainerVariant } from './container.type';

import { Slot } from '../slot';

/** Default ARIA roles inferred from the semantic element type. */
const elementRoleMap: Partial<Record<ContainerVariant, AriaRole>> = {
	main: 'main',
	nav: 'navigation',
	header: 'banner',
	footer: 'contentinfo',
	aside: 'complementary',
	article: 'article',
};

/**
 * @description Layout wrapper used to arrange and align content using consistent flex or grid primitives.
 * @returns {JSX.Element} The Container component.
 */
export function Container({
	as = 'div',
	asChild,

	children,

	...props
}: ContainerPropsType): JSX.Element {
	/** Determine default role based on semantic element type and aria attributes. */
	const hasAriaLabel = Boolean(props['aria-label'] || props['aria-labelledby']);
	const inferredRole =
		props['role'] ?? (as === 'section' ? (hasAriaLabel ? 'region' : undefined) : elementRoleMap[as]);

	const componentProps = {
		'data-slot': 'container',
		role: inferredRole,
		...props,
	} as const;

	/** If asChild is true, merge props with the child element (no new DOM node). */
	if (asChild) return <Slot {...componentProps}>{children}</Slot>;

	/* Avoid createElement for common tags (micro-optimization). */
	if (as === 'div') return <div {...componentProps}>{children}</div>;
	if (as === 'span') return <span {...componentProps}>{children}</span>;
	return createElement(as, componentProps, children);
}
