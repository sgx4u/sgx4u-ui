import { ReactNode, RefObject, UIEvent } from 'react';

/** A single entry in the active virtual window. */
export type VirtualizerItemType = {
	/** Zero-based index within the full logical collection. */
	index: number;

	/** Pixel offset from the start of the scrollable track. */
	start: number;

	/** Fixed size of this item along the scroll axis, in pixels. */
	size: number;

	/** Pixel offset of the item's trailing edge (`start + size`). */
	end: number;
};

/** Render-prop state provided by Virtualizer so the consumer owns all layout UI. */
export type VirtualizerRenderPropsType = {
	/** Items that should be mounted for the current scroll window (visible + overscan). */
	virtualItems: Array<VirtualizerItemType>;

	/** Total scrollable size of the track, in pixels (exact when count is known; growing when count is omitted). */
	totalSize: number;

	/** Ref that must be attached to the consumer's scrolling viewport element. */
	viewportRef: RefObject<HTMLDivElement | null>;

	/** Scroll handler that must be attached to the consumer's scrolling viewport. */
	onScroll: (event: UIEvent<HTMLDivElement>) => void;
};

/** Virtualizer props type. */
export type VirtualizerPropsType = {
	/** Total number of logical items. Omit when the length is unknown; the scroll track then grows as the user approaches the end. */
	count?: number;

	/** Fixed size of each logical item along the scroll axis, in pixels. */
	itemSize: number;

	/** Extra items to include above and below the visible range. Default - 50. */
	overscan?: number;

	/** Index to scroll into view when the virtualizer mounts or when this value changes. */
	scrollToIndex?: number;

	/** Renders the consumer-owned UI from the current virtual window. */
	children: (props: VirtualizerRenderPropsType) => ReactNode;
};
