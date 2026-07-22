import { ComponentPropsWithRef, ReactNode } from 'react';

import { TooltipPropsType } from '../tooltip';

/** Props type for the Image component. */
export type ImagePropsType = ComponentPropsWithRef<'img'> & {
	/** Alternative text for the image. */
	alt: string;

	/** Loading behavior of the image. Default - lazy. */
	loading?: ComponentPropsWithRef<'img'>['loading'];
};

/** Props type for the ProgressiveImage component. */
export type ProgressiveImagePropsType = ImagePropsType & {
	/** Super low-res preview (e.g., base64 tiny image or a tiny WebP) shown while the full image loads. */
	placeholderSrc: string;

	/** If true, the image loading will start immediately. Default - true. */
	startLoading?: boolean;
};

/** Props type for the ImageWithTooltip component. */
export type ImageWithTooltipPropsType = ImagePropsType & {
	/** Custom content rendered inside the tooltip shown on hover. */
	tooltipContent: ReactNode;

	/** Props forwarded to the underlying Tooltip, excluding its content and children. */
	tooltipProps?: Omit<TooltipPropsType, 'content' | 'children'>;
};
