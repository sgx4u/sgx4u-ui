import { ReactNode } from 'react';

import { ButtonPropsType } from '../button';
import { ContainerPropsType } from '../container';

/** Carousel orientation. */
export type CarouselOrientationType = 'horizontal' | 'vertical';

/** Context value shared across Carousel sub-components. */
export type CarouselContextType = {
	/** Layout axis of the carousel. */
	orientation: CarouselOrientationType;

	/** Index of the currently visible logical slide. */
	activeIndex: number;

	/** Visual track index, including cloned edge slides when looping. */
	trackIndex: number;

	/** Whether the track transform should animate. */
	isTransitionEnabled: boolean;

	/** Total number of real slides (excluding clones). */
	slideCount: number;

	/** Registers (or updates) the total slide count. */
	setSlideCount: (count: number) => void;

	/** Moves to the previous slide, wrapping seamlessly when loop is enabled. */
	scrollPrevious: () => void;

	/** Moves to the next slide, wrapping seamlessly when loop is enabled. */
	scrollNext: () => void;

	/** Jumps directly to a slide by index. */
	scrollTo: (index: number) => void;

	/** Settles the track after a clone slide transition completes. */
	handleTrackTransitionEnd: () => void;

	/** Whether scrolling past the first/last slide wraps around. */
	loop: boolean;
};

/** Carousel props type. */
export type CarouselPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Layout axis of the carousel. Default - horizontal. */
	orientation?: CarouselOrientationType;

	/** Index of the slide to display initially. Default - 0. */
	startIndex?: number;

	/** Whether scrolling past the first/last slide wraps around. Default - false. */
	loop?: boolean;

	/** Milliseconds between automatic slide advances. When omitted, autoplay is disabled. */
	autoplayInterval?: number;

	/** Callback invoked whenever the active slide index changes. */
	onSlideChange?: (index: number) => void;

	/** Carousel content. */
	children: ReactNode;
};

/** Carousel content props type. */
export type CarouselContentPropsType = ContainerPropsType;

/** Carousel item props type. */
export type CarouselItemPropsType = ContainerPropsType;

/** Carousel previous/next control props type. */
export type CarouselControlPropsType = ButtonPropsType;
