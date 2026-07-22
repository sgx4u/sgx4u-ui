import { createElement, JSX } from 'react';

import { TextStylePropsType, TextStyleVariantType } from './text-style.type';

import { Slot } from '../slot/Slot';

/** Text tags. */
const textTags: Record<TextStyleVariantType, keyof JSX.IntrinsicElements> = {
	bold: 'b',
	delete: 'del',
	insert: 'ins',
	emphasize: 'em',
	italic: 'i',
	mark: 'mark',
	small: 'small',
	strikethrough: 's',
	strong: 'strong',
	subscript: 'sub',
	superscript: 'sup',
	underline: 'u',
};

/**
 * @description Inline text formatting primitives for emphasizing, underlining, or annotating existing content.
 * @returns {JSX.Element} The TextStyle component.
 */
export function TextStyle({
	as = 'bold',
	asChild,

	children,
	...props
}: TextStylePropsType): JSX.Element {
	const tagName = textTags[as];

	const componentProps = {
		'data-slot': 'text-style',
		...props,
	} as const;

	/** If asChild is true, merge props with the child element (no new DOM node). */
	if (asChild) return <Slot {...componentProps}>{children}</Slot>;

	/** Use createElement to create the element dynamically. */
	return createElement(tagName, componentProps, children);
}
