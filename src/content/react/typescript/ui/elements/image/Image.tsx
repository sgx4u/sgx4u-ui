import { JSX } from 'react';

import { ImagePropsType } from './image.type';

import { ProgressiveImage } from './ProgressiveImage';

/**
 * @name Image
 * @description Enhanced image primitives for displaying pictures with optional progressive loading and performance-friendly defaults.
 * @returns {JSX.Element} The Image component.
 */
export function Image({ placeholderSrc, noLazyLoad, startLoading, className, ...props }: ImagePropsType): JSX.Element {
	const ariaTitle = props.title ?? props.alt;
	const loadingAttr = noLazyLoad ? undefined : 'lazy';
	const decodingAttr = noLazyLoad ? undefined : 'async';

	/** If placeholder source is provided, use the ProgressiveImage component. */
	if (placeholderSrc) {
		return (
			<ProgressiveImage
				startLoading={startLoading}
				placeholderSrc={placeholderSrc}
				noLazyLoad={noLazyLoad}
				className={className}
				{...props}
			/>
		);
	}

	/** If placeholder source is not provided, use the native img tag. */
	return (
		<img
			title={ariaTitle}
			loading={loadingAttr}
			decoding={decodingAttr}
			className={className}
			data-slot="image"
			{...props}
			alt={props.alt ?? props.title ?? 'image'}
		/>
	);
}
