'use client';

import { JSX, SyntheticEvent, useEffect, useRef, useState } from 'react';

import { ProgressiveImagePropsType } from './image.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container/Container';

/**
 * @description Progressive image loader that fades from a low-quality placeholder into the final image using decode-aware loading and smooth opacity transitions.
 * @returns {JSX.Element} The ProgressiveImage component.
 */
export function ProgressiveImage({
	startLoading = true,
	placeholderSrc,
	loading = 'lazy',
	className,

	...props
}: ProgressiveImagePropsType): JSX.Element {
	const [isLoaded, setIsLoaded] = useState(false);

	/** Reference to the full image element. */
	const fullImageRef = useRef<HTMLImageElement | null>(null);

	const ariaTitle = props.title ?? props.alt;
	const decodingAttr = loading === 'lazy' ? 'async' : 'sync';

	useEffect(() => {
		if (!startLoading) return;

		const imageElement = fullImageRef.current;
		if (!imageElement) return;

		/** Reveal immediately when the image is already cached. */
		if (imageElement.complete && imageElement.naturalWidth > 0) {
			setIsLoaded(true);
			return;
		}

		/** Without decode support the onLoad handler drives the reveal. */
		if (typeof imageElement.decode !== 'function') return;

		/** Prefer decode() for a smoother reveal; onLoad covers the case where it rejects. */
		let cancelled = false;
		imageElement
			.decode()
			.then(() => {
				if (!cancelled) setIsLoaded(true);
			})
			.catch(() => {
				/** Decode can reject for cross-origin images; the onLoad handler covers this. */
			});

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
				loading={loading}
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
