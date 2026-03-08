'use client';

import { JSX, SyntheticEvent, useEffect, useRef, useState } from 'react';

import { ImagePropsType } from './image.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container/Container';

/**
 * @description Progressive image loader that fades from a low-quality placeholder into the final image using decode-aware loading and smooth opacity transitions.
 * @returns {JSX.Element} The ProgressiveImage component.
 */
export function ProgressiveImage({
	startLoading = true,
	placeholderSrc,
	noLazyLoad,
	className,

	...props
}: ImagePropsType): JSX.Element {
	/** State for the loading of the image. */
	const [isLoaded, setIsLoaded] = useState(false);

	/** Reference to the full image element. */
	const fullImageRef = useRef<HTMLImageElement | null>(null);

	const ariaTitle = props.title ?? props.alt;
	const loadingAttr = noLazyLoad ? undefined : 'lazy';
	const decodingAttr = noLazyLoad ? undefined : 'async';

	useEffect(() => {
		if (!startLoading) return;

		/** Get the image element. */
		const imageElement = fullImageRef.current;
		if (!imageElement) return;

		/** If already complete, we’re done (covers cache). */
		if (imageElement.complete && imageElement.naturalWidth > 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsLoaded(true);
			return;
		}

		/** Try decode() for a smoother ready signal. */
		let cancelled = false;
		if ('decode' in imageElement && typeof imageElement.decode === 'function') {
			imageElement
				.decode()
				.catch(() => {}) /** Decode can reject for cross-origin/etc—fallback to load. */
				.finally(() => {
					if (!cancelled) setIsLoaded(true);
				});
		} else {
			/** Fallback: rely on onLoad (attached below) and a periodic check. */
			const tick = setInterval(() => {
				if (imageElement.complete && imageElement.naturalWidth > 0) {
					clearInterval(tick);
					if (!cancelled) setIsLoaded(true);
				}
			}, 50);
			return (): void => clearInterval(tick);
		}

		return (): void => {
			cancelled = true;
		};
	}, [props.src, startLoading]);

	const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>): void => {
		if (!startLoading) return;
		setIsLoaded(true);
		props.onLoad?.(event);
	};

	return (
		<Container
			as="span"
			className={cn('relative inline-block overflow-hidden', className)}
			data-slot="progressive-image"
			data-state={isLoaded ? 'loaded' : 'loading'}
			role="img"
			aria-label={ariaTitle}
		>
			{/* Placeholder image. */}
			<img
				src={placeholderSrc}
				alt=""
				aria-hidden="true"
				draggable={false}
				className={cn(
					'block h-auto w-full transition-all duration-1000 ease-in-out select-none',
					isLoaded ? 'opacity-0' : 'opacity-100',
					className,
				)}
				data-slot="progressive-image-placeholder"
			/>
			{/* Full image. */}
			<img
				ref={fullImageRef}
				title={ariaTitle}
				loading={loadingAttr}
				decoding={decodingAttr}
				onLoad={handleLoad}
				className={cn(
					'absolute inset-0 block h-auto w-full transition-all duration-1000 ease-in-out',
					isLoaded ? 'opacity-100' : 'opacity-0',
					className,
				)}
				data-slot="progressive-image-full"
				{...props}
				alt={props.alt ?? props.title ?? 'image'}
			/>
		</Container>
	);
}
