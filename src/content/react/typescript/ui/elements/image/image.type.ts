import { ComponentPropsWithRef } from 'react';

/** Props type for the Image component. */
export type ImagePropsType = ComponentPropsWithRef<'img'> & {
	/** Alternative text for the image. */
	alt: string;

	/** If true, the image loading will start immediately. */
	startLoading?: boolean;

	/** Provide a super low-res preview (e.g., base64 tiny image or a tiny WebP). */
	placeholderSrc?: string;

	/** If true, the image is not lazily loaded. */
	noLazyLoad?: boolean;
};
