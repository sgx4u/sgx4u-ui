'use client';

import { JSX, useMemo } from 'react';

import { HighlightPropsType } from './highlight.type';
import { makeVariants } from '../../utils/variant.util';
import { extractTextFromNode, processNode } from './highlight.helper';

import { Container } from '../container';

/** Variants for the Highlight component. */
export const { variants: highlightMarkVariants, types: HighlightMarkVariantTypes } = makeVariants({
	base: 'rounded bg-transparent font-medium',
	variants: {
		variant: {
			default: 'bg-primary-light text-primary',
			outlined: 'border-2 border-primary text-primary',
			underline: 'rounded-none border-b-2 border-primary text-primary',
			marker: 'rounded-none bg-linear-to-b from-transparent from-50% via-primary-light via-50% to-primary-light',
		},
	},
	default: {
		variant: 'default',
	},
});

/**
 * @name Highlight
 * @description Text helper that visually emphasizes matches within content, often used for search results.
 * @returns {JSX.Element} The Highlight component.
 */
export function Highlight({
	query,

	caseSensitive = false,
	wholeWords = false,
	variant = 'default',

	children,

	containerProps = {},
	...props
}: HighlightPropsType): JSX.Element {
	const { className: highlightClassName, ...highlightRestProps } = props;

	const highlightedChildren = useMemo(() => {
		/** Trim the query and return children if query is empty. */
		const trimmedQuery = query.trim();
		if (!trimmedQuery) return children;

		/** Build regex once and reuse for case sensitivity. */
		const flags = caseSensitive ? 'g' : 'gi';
		const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		/** Build pattern with word boundaries if wholeWords is enabled. */
		let pattern = escapedQuery;
		if (wholeWords) pattern = `(?<=^|\\s)${escapedQuery}(?=$|\\s)`;

		const regex = new RegExp(pattern, flags);

		/** Extract text once to check for a match. */
		const allText = extractTextFromNode(children);
		if (!regex.test(allText)) return children;

		/** Reset regex lastIndex after test (safety for global flag). */
		regex.lastIndex = 0;

		return processNode({ node: children, regex, variant, className: highlightClassName, ...highlightRestProps });
	}, [children, query, caseSensitive, wholeWords, variant, highlightClassName, highlightRestProps]);

	return (
		<Container as="span" {...containerProps}>
			{highlightedChildren}
		</Container>
	);
}
