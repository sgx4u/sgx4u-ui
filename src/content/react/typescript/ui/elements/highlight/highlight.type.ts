import { ContainerPropsType } from '../container';
import { TextPropsType } from '../text';
import { HighlightMarkVariantTypes } from './Highlight';

/** Props type for the Highlight component. */
export type HighlightPropsType = Omit<TextPropsType, 'as' | 'variant'> & {
	/** Search query. */
	query: string;

	/** Whether to match case sensitive. Default - false. */
	caseSensitive?: boolean;

	/** Whether to match whole words only. Default - false. */
	wholeWords?: boolean;

	/** Highlight variant. Default - default. */
	variant?: typeof HighlightMarkVariantTypes.variant;

	/** Props to be passed to the container. */
	containerProps?: Omit<ContainerPropsType, 'as'> & {
		/** HTML element to render as. Default - span. */
		as?: ContainerPropsType['as'];
	};
};

/** Props type for the processNode function. */
export type ProcessNodePropsType = Omit<HighlightPropsType, 'query' | 'caseSensitive' | 'wholeWords' | 'children'> & {
	/** Node to process. */
	node: HighlightPropsType['children'];

	/** Regex to use. */
	regex: RegExp;
};

/** Props type for the createHighlightedText function. */
export type CreateHighlightedTextPropsType = Omit<
	HighlightPropsType,
	'query' | 'caseSensitive' | 'wholeWords' | 'children'
> & {
	/** Text to process. */
	text: string;

	/** Regex to use. */
	regex: RegExp;
};
