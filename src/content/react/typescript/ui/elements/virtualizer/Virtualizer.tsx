'use client';

import { JSX, UIEvent, useEffect, useRef, useState } from 'react';

import { VirtualizerPropsType } from './virtualizer.type';
import { getVirtualizerRange } from './virtualizer.helper';

/**
 * @description Headless sliding-window virtualizer that reports which logical items to mount (plus overscan) without owning list or grid UI, so consumers can optimize massive collections of any layout.
 * @returns {JSX.Element} The Virtualizer component.
 */
export function Virtualizer({
	count,
	itemSize,
	overscan = 50,
	scrollToIndex,
	children,
}: VirtualizerPropsType): JSX.Element {
	/** Reference to the viewport element. */
	const viewportRef = useRef<HTMLDivElement | null>(null);

	const [scrollOffset, setScrollOffset] = useState(0);
	const [viewportSize, setViewportSize] = useState(0);

	const { virtualItems, totalSize } = getVirtualizerRange({
		count,
		itemSize,
		scrollOffset,
		viewportSize,
		overscan,
	});

	/**
	 * @description Syncs viewport size on mount and whenever the viewport is resized.
	 * @returns {void}
	 */
	useEffect(() => {
		const viewportElement = viewportRef.current;
		if (!viewportElement) return;

		const updateViewportSize = (): void => {
			setViewportSize(viewportElement.clientHeight);
		};

		updateViewportSize();

		/** Create a resize observer to update the viewport size whenever the viewport is resized. */
		const resizeObserver = new ResizeObserver(updateViewportSize);
		resizeObserver.observe(viewportElement);

		return (): void => {
			resizeObserver.disconnect();
		};
	}, []);

	/**
	 * @description Scrolls the viewport so the given index is aligned near the start when scrollToIndex changes.
	 * @returns {void}
	 */
	useEffect(() => {
		if (scrollToIndex === undefined) return;
		if (scrollToIndex < 0) return;
		if (count !== undefined && scrollToIndex >= count) return;

		const viewportElement = viewportRef.current;
		if (!viewportElement) return;

		const nextScrollOffset = scrollToIndex * itemSize;
		viewportElement.scrollTop = nextScrollOffset;
		setScrollOffset(nextScrollOffset);
	}, [scrollToIndex, count, itemSize]);

	/**
	 * @description Updates the sliding window from the viewport scroll position.
	 * @param {UIEvent<HTMLDivElement>} event - The scroll event from the viewport.
	 * @returns {void}
	 */
	const onScroll = (event: UIEvent<HTMLDivElement>): void => {
		setScrollOffset(event.currentTarget.scrollTop);
	};

	return <>{children({ virtualItems, totalSize, viewportRef, onScroll })}</>;
}
