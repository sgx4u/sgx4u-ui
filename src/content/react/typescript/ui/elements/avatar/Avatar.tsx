'use client';

import { createContext, JSX, SyntheticEvent, useContext, useEffect, useState } from 'react';

import { AvatarContextType, AvatarFallbackPropsType, AvatarImagePropsType, AvatarPropsType } from './avatar.type';
import { stringToColor } from '../../utils/string.util';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';
import { Image } from '../image';
import { Text } from '../text';

/** Context for the Avatar component. */
const AvatarContext = createContext<AvatarContextType>({
	hasImage: false,
	setHasImage: () => {},
	imageError: false,
	setImageError: () => {},
});

/** Variants for the Avatar component. */
export const { variants: avatarVariants, types: AvatarVariantTypes } = makeVariants({
	base: 'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted',
	variants: {
		size: {
			xs: 'size-6',
			sm: 'size-8',
			default: 'size-10',
			lg: 'size-12',
			xl: 'size-16',
		},
		radius: {
			none: 'rounded-none',
			sm: 'rounded-md',
			md: 'rounded-lg',
			lg: 'rounded-xl',
			full: 'rounded-full',
		},
	},
	default: {
		size: 'default',
		radius: 'full',
	},
});

/**
 * @name Avatar
 * @description A visual representation of a user, typically displayed as a circular or rounded image with an optional fallback.
 * @returns {JSX.Element} The Avatar component.
 */
export function Avatar({
	size = 'default',
	radius = 'full',
	className,

	...props
}: AvatarPropsType): JSX.Element {
	/** Whether an image component exists. */
	const [hasImage, setHasImage] = useState(false);
	/** Whether the image has failed to load. */
	const [imageError, setImageError] = useState(false);

	return (
		<AvatarContext.Provider
			value={{
				hasImage,
				setHasImage,
				imageError,
				setImageError,
			}}
		>
			<Container
				as="div"
				className={cn(avatarVariants({ size, radius }), className)}
				data-slot="avatar"
				{...props}
			/>
		</AvatarContext.Provider>
	);
}

/**
 * @name Avatar Image
 * @description The image displayed within the avatar. Automatically hides when the image fails to load.
 * @returns {JSX.Element} The AvatarImage component.
 */
export function AvatarImage({ className, onError, ...props }: AvatarImagePropsType): JSX.Element {
	const { hasImage, imageError, setHasImage, setImageError } = useContext(AvatarContext);

	/** Mark that an image component exists. */
	useEffect(() => {
		if (props.src) setHasImage(true);
		return (): void => {
			setHasImage(false);
		};
	}, [setHasImage, props.src]);

	const handleError = (event: SyntheticEvent<HTMLImageElement, Event>): void => {
		setImageError(true);
		onError?.(event);
	};

	if (!hasImage || imageError) return <></>;
	return (
		<Image
			className={cn('size-full object-cover', className)}
			data-slot="avatar-image"
			onError={handleError}
			{...props}
			alt={props.alt ?? props.title ?? 'avatar'}
		/>
	);
}

/**
 * @name Avatar Fallback
 * @description Fallback text displayed when the avatar image fails to load or is not provided.
 * @returns {JSX.Element} The AvatarFallback component.
 */
export function AvatarFallback({ colors, className, ...props }: AvatarFallbackPropsType): JSX.Element {
	const { hasImage, imageError } = useContext(AvatarContext);

	const fallbackColor = stringToColor({ value: String(props.children ?? ''), type: 'bg', colors });

	/** Show fallback if no image is provided, or if image has errored. */
	if (hasImage && !imageError) return <></>;

	return (
		<Text
			as="span"
			className={cn(
				'absolute inset-0 inline-flex size-full items-center justify-center font-semibold',
				fallbackColor,
				className,
			)}
			data-slot="avatar-fallback"
			{...props}
		/>
	);
}
