import { cloneElement, isValidElement, ReactElement, ReactNode } from 'react';

import { CreateHighlightedTextPropsType, ProcessNodePropsType } from './highlight.type';
import { cn } from '../../utils/styles.util';

import { Text } from '../text';
import { highlightMarkVariants } from './Highlight';

/**
 * @description Helper function to extract text content from React nodes.
 * @param {ReactNode} node - The node to extract text from.
 * @returns {string} The text content from the node.
 */
export function extractTextFromNode(node: ReactNode): string {
	/** If node is a string or number, return the string value. */
	if (typeof node === 'string' || typeof node === 'number') return String(node);

	if (isValidElement(node)) {
		/** If children is not present, return empty string. */
		const { children } = node.props as { children?: ReactNode };
		if (!children) return '';

		/** If children is a string or number, extract text from children. */
		if (typeof children === 'string' || typeof children === 'number') return String(children);
		/** If children is an array, extract text from each child. */
		if (Array.isArray(children)) return children.map(extractTextFromNode).join('');

		return extractTextFromNode(children);
	}

	/** If node is an array, extract text from each child. */
	if (Array.isArray(node)) return node.map(extractTextFromNode).join('');

	return '';
}

/**
 * @description Helper function to recursively process React nodes and apply highlighting.
 * @param {ProcessNodePropsType} props - The props for the processNode function.
 * @returns {ReactNode} The processed node.
 */
export function processNode({ node, regex, ...props }: ProcessNodePropsType): ReactNode {
	if (typeof node === 'string' || typeof node === 'number') {
		/** Convert node to string. */
		const text = String(node);
		const highlightedNodes = createHighlightedText({ text, regex, ...props });

		/** If we have multiple nodes (highlighted), wrap them in a fragment. */
		return highlightedNodes.length > 1 ? <>{highlightedNodes}</> : highlightedNodes[0] || text;
	}

	if (isValidElement(node)) {
		/** If there is no children, return the element. */
		const element = node as ReactElement<{ children?: ReactNode }>;
		const { children } = element.props;
		if (!children) return element;

		/** Process the children recursively. */
		const processedChildren = Array.isArray(children)
			? children.map((child) => processNode({ node: child, regex, ...props }))
			: processNode({ node: children, regex, ...props });

		/** Only clone if children actually changed. */
		if (processedChildren !== children) {
			return cloneElement(element, { ...element.props, children: processedChildren });
		}

		return element;
	}

	if (Array.isArray(node)) {
		return node.map((child) => processNode({ node: child, regex, ...props }));
	}

	return node;
}

/**
 * @description Helper function to create highlighted text nodes.
 * @param {CreateHighlightedTextPropsType} props - The props for the createHighlightedText function.
 * @returns {Array<ReactNode>} The highlighted text nodes.
 */
export function createHighlightedText({
	text,
	regex,
	variant,
	className,
	...props
}: CreateHighlightedTextPropsType): Array<ReactNode> {
	/** If text is not present or does not match the regex, return the text. */
	if (!text || !regex.test(text)) return [text];

	/** Ensure regex starts fresh for global matches. */
	regex.lastIndex = 0;

	/** Split the text into parts using the regex. */
	const parts = text.split(regex);
	/** Get the matches from the text using the regex. */
	const matches = text.match(regex) || [];

	/** Initialize the result array. */
	const result: Array<ReactNode> = [];

	/** Loop through the parts and add the parts to the result array. */
	for (let index = 0; index < parts.length; index++) {
		/** If the part is not empty, add it to the result array. */
		if (parts[index]) result.push(parts[index]);
		/** If the index is less than the matches length, add the match to the result array. */
		if (index < matches.length) {
			result.push(
				<Text
					key={`highlight-${index}`}
					as="span"
					className={cn(highlightMarkVariants({ variant }), className)}
					data-slot="highlight"
					aria-label={`Highlighted text: ${matches[index]}`}
					{...props}
				>
					{matches[index]}
				</Text>,
			);
		}
	}

	return result;
}
