'use client';

import {
	Children,
	cloneElement,
	createContext,
	isValidElement,
	JSX,
	ReactElement,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import {
	CarouselContentPropsType,
	CarouselContextType,
	CarouselControlPropsType,
	CarouselItemPropsType,
	CarouselPropsType,
} from './carousel.type';
import { cn } from '../../utils/styles.util';
import { getNextSlideIndex, getTrackIndexFromSlideIndex } from './carousel.helper';

import { useReducedMotion } from '../../hooks/useReducedMotion.hook';

import { Button } from '../button';
import { Container } from '../container';

const CarouselContext = createContext<CarouselContextType | null>(null);

/**
 * @description Accesses the current carousel context, guarding against usage outside a Carousel.
 * @returns {CarouselContextType} The current carousel context.
 */
function useCarouselContext(): CarouselContextType {
	const context = useContext(CarouselContext);
	if (!context) throw new Error('Carousel components must be used inside <Carousel>.');
	return context;
}

/**
 * @description Slideshow container that transforms its content track to reveal one slide at a time, with optional seamless looping and autoplay.
 * @returns {JSX.Element} The Carousel component.
 */
export function Carousel({
	orientation = 'horizontal',
	startIndex = 0,
	loop = false,
	autoplayInterval,
	onSlideChange,

	className,
	children,
	...props
}: CarouselPropsType): JSX.Element {
	const [slideCount, setSlideCountState] = useState(0);
	const [activeIndex, setActiveIndex] = useState(startIndex);
	const [trackIndex, setTrackIndex] = useState(startIndex);
	const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
	const [loopState, setLoopState] = useState(loop);

	const prefersReducedMotion = useReducedMotion();

	const isSettlingRef = useRef(false);
	const pendingTrackIndexRef = useRef<number | null>(null);

	const canLoop = loop && slideCount > 1;

	/** Keep the track aligned when the loop prop changes after mount. */
	if (loop !== loopState) {
		setLoopState(loop);
		if (slideCount > 0) {
			setTrackIndex(
				getTrackIndexFromSlideIndex({
					slideIndex: activeIndex,
					loop: loop && slideCount > 1,
					slideCount,
				}),
			);
		}
	}

	/**
	 * @description Registers the real slide count and seeds the track position on first count.
	 * @param {number} count - The number of real slides.
	 * @returns {void}
	 */
	const setSlideCount = (count: number): void => {
		setSlideCountState((currentCount) => {
			if (currentCount === count) return currentCount;

			const clampedStartIndex = count <= 0 ? 0 : Math.max(0, Math.min(count - 1, startIndex));
			setActiveIndex(clampedStartIndex);
			setTrackIndex(
				getTrackIndexFromSlideIndex({
					slideIndex: clampedStartIndex,
					loop: loop && count > 1,
					slideCount: count,
				}),
			);
			return count;
		});
	};

	/**
	 * @description Commits a logical slide index and notifies listeners.
	 * @param {number} index - The logical slide index.
	 * @returns {void}
	 */
	const commitActiveIndex = (index: number): void => {
		setActiveIndex(index);
		onSlideChange?.(index);
	};

	/**
	 * @description Snaps from a cloned edge slide to the matching real slide without animating backwards.
	 * @returns {void}
	 */
	const settleFromClone = (): void => {
		const pendingTrackIndex = pendingTrackIndexRef.current;
		if (pendingTrackIndex === null) return;

		pendingTrackIndexRef.current = null;
		setIsTransitionEnabled(false);
		setTrackIndex(pendingTrackIndex);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				setIsTransitionEnabled(true);
				isSettlingRef.current = false;
			});
		});
	};

	/**
	 * @description Moves the track by one step, using a cloned edge slide when wrapping.
	 * @param {1 | -1} step - The direction to move.
	 * @returns {void}
	 */
	const scrollByStep = (step: 1 | -1): void => {
		if (slideCount <= 0 || isSettlingRef.current) return;

		if (!canLoop) {
			const nextIndex = getNextSlideIndex({ currentIndex: activeIndex, slideCount, step, loop: false });
			if (nextIndex === activeIndex) return;
			setIsTransitionEnabled(true);
			setTrackIndex(nextIndex);
			commitActiveIndex(nextIndex);
			return;
		}

		const nextTrackIndex = trackIndex + step;
		setIsTransitionEnabled(!prefersReducedMotion);
		setTrackIndex(nextTrackIndex);

		/** Moving onto a cloned edge slide; settle to the real slide after the animation. */
		if (nextTrackIndex === 0 || nextTrackIndex === slideCount + 1) {
			isSettlingRef.current = true;
			pendingTrackIndexRef.current = nextTrackIndex === 0 ? slideCount : 1;
			commitActiveIndex(nextTrackIndex === 0 ? slideCount - 1 : 0);

			if (prefersReducedMotion) {
				requestAnimationFrame(() => settleFromClone());
			}
			return;
		}

		commitActiveIndex(nextTrackIndex - 1);
	};

	const scrollPrevious = (): void => scrollByStep(-1);
	const scrollNext = (): void => scrollByStep(1);
	const scrollByStepRef = useRef(scrollByStep);

	useEffect(() => {
		scrollByStepRef.current = scrollByStep;
	});

	/**
	 * @description Jumps directly to a logical slide index.
	 * @param {number} index - The target slide index.
	 * @returns {void}
	 */
	const scrollTo = (index: number): void => {
		if (slideCount <= 0 || isSettlingRef.current) return;

		const nextIndex = Math.max(0, Math.min(slideCount - 1, index));
		setIsTransitionEnabled(!prefersReducedMotion);
		setTrackIndex(getTrackIndexFromSlideIndex({ slideIndex: nextIndex, loop: canLoop, slideCount }));
		commitActiveIndex(nextIndex);
	};

	const handleTrackTransitionEnd = settleFromClone;

	useEffect(() => {
		if (!autoplayInterval || prefersReducedMotion || slideCount <= 1) return;

		const intervalId = setInterval(() => {
			scrollByStepRef.current(1);
		}, autoplayInterval);

		return (): void => clearInterval(intervalId);
	}, [autoplayInterval, prefersReducedMotion, slideCount, loop]);

	return (
		<CarouselContext.Provider
			value={{
				orientation,
				activeIndex,
				trackIndex,
				isTransitionEnabled,
				slideCount,
				setSlideCount,
				scrollPrevious,
				scrollNext,
				scrollTo,
				handleTrackTransitionEnd,
				loop,
			}}
		>
			<Container
				className={cn('relative', className)}
				data-slot="carousel"
				role="region"
				aria-roledescription="carousel"
				{...props}
			>
				{children}
			</Container>
		</CarouselContext.Provider>
	);
}

/**
 * @description Builds a cloned slide element with a stable key for the looping track.
 * @param {ReactNode} child - The original slide node.
 * @param {string} key - The React key for the clone.
 * @returns {ReactNode} The cloned slide, or the original node when it is not a valid element.
 */
function cloneCarouselSlide(child: ReactNode, key: string): ReactNode {
	if (!isValidElement(child)) return child;
	return cloneElement(child as ReactElement, { key });
}

/**
 * @description Sliding track that positions all CarouselItem children in a row (or column) and translates to the active slide.
 * @returns {JSX.Element} The CarouselContent component.
 */
export function CarouselContent({ className, children, ...props }: CarouselContentPropsType): JSX.Element {
	const { orientation, trackIndex, isTransitionEnabled, loop, setSlideCount, handleTrackTransitionEnd } =
		useCarouselContext();

	const isHorizontal = orientation === 'horizontal';
	const childArray = Children.toArray(children);
	const slideCount = childArray.length;
	const canLoop = loop && slideCount > 1;

	useEffect(() => {
		setSlideCount(slideCount);
	}, [slideCount, setSlideCount]);

	const trackChildren = canLoop
		? [
				cloneCarouselSlide(childArray[slideCount - 1], 'carousel-clone-last'),
				...childArray,
				cloneCarouselSlide(childArray[0], 'carousel-clone-first'),
			]
		: childArray;

	return (
		<Container className="overflow-hidden" data-slot="carousel-content-viewport">
			<Container
				style={{
					transform: isHorizontal ? `translateX(-${trackIndex * 100}%)` : `translateY(-${trackIndex * 100}%)`,
				}}
				onTransitionEnd={(event) => {
					if (event.target !== event.currentTarget) return;
					if (event.propertyName !== 'transform') return;
					handleTrackTransitionEnd();
				}}
				className={cn(
					'flex ease-out',
					isTransitionEnabled && 'transition-transform duration-300',
					isHorizontal ? 'flex-row' : 'flex-col',
					className,
				)}
				data-slot="carousel-content"
				{...props}
			>
				{trackChildren}
			</Container>
		</Container>
	);
}

/**
 * @description A single slide within the carousel, sized to fill the viewport.
 * @returns {JSX.Element} The CarouselItem component.
 */
export function CarouselItem({ className, ...props }: CarouselItemPropsType): JSX.Element {
	return (
		<Container
			className={cn('min-w-0 shrink-0 grow-0 basis-full', className)}
			data-slot="carousel-item"
			role="group"
			aria-roledescription="slide"
			{...props}
		/>
	);
}

/**
 * @description Control that navigates to the previous slide.
 * @returns {JSX.Element} The CarouselPrevious component.
 */
export function CarouselPrevious({
	variant = 'secondary',
	size = 'icon-sm',
	className,
	children,
	...props
}: CarouselControlPropsType): JSX.Element {
	const { scrollPrevious, activeIndex, loop } = useCarouselContext();

	return (
		<Button
			variant={variant}
			size={size}
			onClick={scrollPrevious}
			disabled={!loop && activeIndex === 0}
			className={cn('rounded-full', className)}
			data-slot="carousel-previous"
			aria-label="Previous slide"
			{...props}
		>
			{children ?? <ChevronLeftIcon />}
		</Button>
	);
}

/**
 * @description Control that navigates to the next slide.
 * @returns {JSX.Element} The CarouselNext component.
 */
export function CarouselNext({
	variant = 'secondary',
	size = 'icon-sm',
	className,
	children,
	...props
}: CarouselControlPropsType): JSX.Element {
	const { scrollNext, activeIndex, slideCount, loop } = useCarouselContext();

	return (
		<Button
			variant={variant}
			size={size}
			onClick={scrollNext}
			disabled={!loop && activeIndex === slideCount - 1}
			className={cn('rounded-full', className)}
			data-slot="carousel-next"
			aria-label="Next slide"
			{...props}
		>
			{children ?? <ChevronRightIcon />}
		</Button>
	);
}
