'use client';

import { JSX, KeyboardEvent as ReactKeyboardEvent, useState } from 'react';

import { GalleryItemType, GalleryPropsType } from './gallery.type';
import { isActivationKey, moveFocusByDirection } from '../../utils/keyboard.util';
import { cn } from '../../utils/styles.util';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../carousel';
import { Container } from '../container';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '../dialog';
import { Image } from '../image';
import { Text } from '../text';
import { VisuallyHidden } from '../visually-hidden';

/**
 * @description Grid or masonry gallery of image thumbnails that opens a full-screen, navigable lightbox when a thumbnail is selected.
 * @returns {JSX.Element} The Gallery component.
 */
export function Gallery({
	items,
	openIndex,
	onOpenIndexChange,
	mode = 'grid',
	columns = 3,
	className,

	imageProps,
	'aria-label': ariaLabel = 'Image gallery',
	...props
}: GalleryPropsType): JSX.Element {
	const [internalOpenIndex, setInternalOpenIndex] = useState<number | undefined>(undefined);
	const currentOpenIndex = openIndex ?? internalOpenIndex;

	/** Start slide for the current lightbox session. */
	const [lightboxStartIndex, setLightboxStartIndex] = useState<number>(0);

	/** Increments on each open so the Carousel remounts even when the same thumbnail is selected again. */
	const [lightboxSessionKey, setLightboxSessionKey] = useState(0);

	const isMasonry = mode === 'masonry';
	const columnCount = Math.max(1, columns);
	const openItem = currentOpenIndex === undefined ? undefined : items[currentOpenIndex];

	/**
	 * @description Updates the open lightbox index for controlled and uncontrolled usage.
	 * @param {number | undefined} index - The open item index, or undefined to close.
	 * @returns {void}
	 */
	const setOpenIndex = (index: number | undefined): void => {
		onOpenIndexChange?.(index);
		if (openIndex === undefined) setInternalOpenIndex(index);
	};

	/**
	 * @description Opens the lightbox at the given thumbnail index.
	 * @param {number} index - The thumbnail index to open.
	 * @returns {void}
	 */
	const openLightbox = (index: number): void => {
		if (index < 0 || index >= items.length) return;
		setLightboxStartIndex(index);
		setLightboxSessionKey((sessionKey) => sessionKey + 1);
		setOpenIndex(index);
	};

	/**
	 * @description Opens the lightbox from keyboard activation on a thumbnail.
	 * @param {ReactKeyboardEvent<HTMLDivElement>} event - The keyboard event.
	 * @param {number} index - The thumbnail index to open.
	 * @returns {void}
	 */
	const handleThumbnailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, index: number): void => {
		if (!isActivationKey(event.key)) return;
		event.preventDefault();
		openLightbox(index);
	};

	/**
	 * @description Moves focus across thumbnails with arrow, Home, and End keys.
	 * @param {ReactKeyboardEvent<HTMLDivElement>} event - The keyboard event on the gallery group.
	 * @returns {void}
	 */
	const handleGalleryKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
		const thumbnails = Array.from(
			event.currentTarget.querySelectorAll<HTMLElement>('[data-slot="gallery-thumbnail"]'),
		);
		if (thumbnails.length === 0) return;

		if (event.key === 'Home') {
			event.preventDefault();
			moveFocusByDirection({
				elements: thumbnails,
				currentElement: document.activeElement,
				direction: 'first',
			});
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			moveFocusByDirection({
				elements: thumbnails,
				currentElement: document.activeElement,
				direction: 'last',
			});
			return;
		}

		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault();
			moveFocusByDirection({
				elements: thumbnails,
				currentElement: document.activeElement,
				direction: 'next',
			});
			return;
		}

		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			moveFocusByDirection({
				elements: thumbnails,
				currentElement: document.activeElement,
				direction: 'previous',
			});
		}
	};

	/**
	 * @description Renders a single thumbnail control for the gallery layout.
	 * @param {object} props - The thumbnail parameters.
	 * @param {GalleryItemType} props.item - The gallery item to render.
	 * @param {number} props.index - The item index within the gallery.
	 * @returns {JSX.Element} The thumbnail element.
	 */
	function renderThumbnail({ item, index }: { item: GalleryItemType; index: number }): JSX.Element {
		return (
			<Container
				key={`${item.src}-${index}`}
				onClick={() => openLightbox(index)}
				className={cn(
					'cursor-pointer overflow-hidden rounded-lg outline-2 outline-offset-2 outline-transparent focus-visible:outline-primary',
					isMasonry ? 'mb-2 break-inside-avoid' : 'aspect-square',
				)}
				data-slot="gallery-thumbnail"
				role="button"
				tabIndex={0}
				aria-label={`View ${item.alt}`}
				aria-haspopup="dialog"
				onKeyDown={(event) => handleThumbnailKeyDown(event, index)}
			>
				<Image
					{...imageProps}
					src={item.src}
					alt=""
					className={cn(
						'pointer-events-none w-full transition-transform hover:scale-105',
						isMasonry ? 'h-auto object-cover' : 'size-full object-cover',
						imageProps?.className,
					)}
				/>
			</Container>
		);
	}

	return (
		<>
			<Container
				{...props}
				style={
					isMasonry
						? { columnCount: columnCount, columnGap: '0.5rem' }
						: { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }
				}
				className={cn(isMasonry ? 'block' : 'grid gap-2', className)}
				data-slot="gallery"
				data-mode={mode}
				role="group"
				aria-label={ariaLabel}
				onKeyDown={handleGalleryKeyDown}
			>
				{items.map((item, index) => renderThumbnail({ item, index }))}
			</Container>

			<Dialog open={currentOpenIndex !== undefined} onOpenChange={(open) => !open && setOpenIndex(undefined)}>
				<DialogContent className="max-w-3xl bg-transparent p-0 shadow-none" data-slot="gallery-lightbox">
					<VisuallyHidden>
						<DialogTitle>{openItem?.alt ?? 'Image gallery lightbox'}</DialogTitle>
					</VisuallyHidden>

					{currentOpenIndex !== undefined && (
						<Carousel
							key={lightboxSessionKey}
							startIndex={lightboxStartIndex}
							loop
							onSlideChange={setOpenIndex}
							className="w-full"
							aria-label={openItem ? `Lightbox: ${openItem.alt}` : 'Image lightbox'}
						>
							<CarouselContent>
								{items.map((item, index) => (
									<CarouselItem key={`${item.src}-${index}`}>
										<Container className="flex flex-col items-center gap-2">
											<Image
												src={item.src}
												alt={item.alt}
												className="max-h-[70vh] w-auto rounded-lg object-contain"
											/>
											{item.caption && (
												<Text as="body-small" className="text-light">
													{item.caption}
												</Text>
											)}
										</Container>
									</CarouselItem>
								))}
							</CarouselContent>

							<Container className="mt-4 flex justify-center gap-2">
								<CarouselPrevious />
								<CarouselNext />
							</Container>
						</Carousel>
					)}

					<DialogClose className="absolute top-3 right-3" />
				</DialogContent>
			</Dialog>
		</>
	);
}
