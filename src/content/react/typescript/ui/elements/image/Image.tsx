import { JSX } from 'react';

import { ImagePropsType } from './image.type';

/**
 * @description Image primitive for displaying pictures with performance-friendly lazy-loading and decoding defaults.
 * @returns {JSX.Element} The Image component.
 */
export function Image({ loading = 'lazy', className, ...props }: ImagePropsType): JSX.Element {
	const ariaTitle = props.title ?? props.alt;
	const decodingAttr = loading === 'lazy' ? 'async' : 'sync';

	return (
		<img
			title={ariaTitle}
			loading={loading}
			decoding={decodingAttr}
			className={className}
			data-slot="image"
			{...props}
			alt={props.alt ?? props.title ?? 'image'}
		/>
	);
}
