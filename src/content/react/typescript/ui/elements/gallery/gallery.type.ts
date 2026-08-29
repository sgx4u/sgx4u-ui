import { ContainerPropsType } from '../container';
import { ImagePropsType } from '../image';

/** Gallery layout mode. */
export type GalleryModeType = 'grid' | 'masonry';

/** A single image entry rendered by the Gallery. */
export type GalleryItemType = {
	/** Image source URL. */
	src: string;

	/** Accessible description of the image. */
	alt: string;

	/** Optional caption shown in the lightbox. */
	caption?: string;
};

/** Gallery props type. */
export type GalleryPropsType = Omit<ContainerPropsType, 'as' | 'onChange'> & {
	/** Images to display as thumbnails, openable in the lightbox. */
	items: Array<GalleryItemType>;

	/** Controlled index of the currently open lightbox image. Pass undefined to close. */
	openIndex?: number;

	/** Callback invoked when the open index changes (including closing, with undefined). */
	onOpenIndexChange?: (index: number | undefined) => void;

	/** Thumbnail layout mode. Default - grid. */
	mode?: GalleryModeType;

	/** Number of thumbnail columns. Default - 3. */
	columns?: number;

	/** Accessible name for the thumbnail group. Default - Image gallery. */
	'aria-label'?: string;

	/** Additional props applied to each thumbnail image. */
	imageProps?: Omit<ImagePropsType, 'src' | 'alt'>;
};
