'use client';

import { createContext, JSX, SyntheticEvent, useContext, useState } from 'react';

import {
	AvatarContextType,
	AvatarFallbackPropsType,
	AvatarImagePropsType,
	AvatarImageStatusType,
	AvatarPropsType,
} from './avatar.type';
import { stringToColor } from '../../utils/string.util';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';
import { Image } from '../image';
import { Text } from '../text';

/** Context for the Avatar component. */
const AvatarContext = createContext<AvatarContextType>({
	status: 'idle',
	setStatus: () => {},
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
			sm: 'rounded-sm',
			md: 'rounded-md',
			lg: 'rounded-lg',
			xl: 'rounded-xl',
			'2xl': 'rounded-2xl',
			'3xl': 'rounded-3xl',
			'4xl': 'rounded-4xl',
			full: 'rounded-full',
		},
	},
	default: {
		size: 'default',
		radius: 'full',
	},
});

/**
 * @description A visual representation of a user, typically displayed as a circular or rounded image with an optional fallback.
 * @returns {JSX.Element} The Avatar component.
 */
export function Avatar({
	size = 'default',
	radius = 'full',
	className,

	...props
}: AvatarPropsType): JSX.Element {
	/** Current loading status of the avatar image, shared with the image and fallback. */
	const [status, setStatus] = useState<AvatarImageStatusType>('idle');

	return (
		<AvatarContext.Provider value={{ status, setStatus }}>
			<Container className={cn(avatarVariants({ size, radius }), className)} data-slot="avatar" {...props} />
		</AvatarContext.Provider>
	);
}

/**
 * @description The image displayed within the avatar. Reveals itself once loaded and hides when it fails to load.
 * @returns {JSX.Element | null} The AvatarImage component, or null when there is no source or the image failed.
 */
export function AvatarImage({ className, onLoad, onError, ref, ...props }: AvatarImagePropsType): JSX.Element | null {
	const { status, setStatus } = useContext(AvatarContext);

	/**
	 * @description Composes the forwarded ref and detects already-cached images whose load event may not fire after mount.
	 * @param {HTMLImageElement | null} node - The mounted image element, or null on unmount.
	 * @returns {void}
	 */
	const registerImage = (node: HTMLImageElement | null): void => {
		if (typeof ref === 'function') ref(node);
		else if (ref) ref.current = node;

		if (node?.complete && node.naturalWidth > 0) setStatus('loaded');
	};

	const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>): void => {
		setStatus('loaded');
		onLoad?.(event);
	};

	const handleError = (event: SyntheticEvent<HTMLImageElement, Event>): void => {
		setStatus('error');
		onError?.(event);
	};

	if (!props.src || status === 'error') return null;

	return (
		<Image
			ref={registerImage}
			className={cn('size-full object-cover', className)}
			data-slot="avatar-image"
			onLoad={handleLoad}
			onError={handleError}
			{...props}
			alt={props.alt ?? props.title ?? 'avatar'}
		/>
	);
}

/**
 * @description Fallback shown while the avatar image loads, when it fails, or when no image is provided.
 * @returns {JSX.Element | null} The AvatarFallback component, or null when the image has loaded.
 */
export function AvatarFallback({ colors, className, ...props }: AvatarFallbackPropsType): JSX.Element | null {
	const { status } = useContext(AvatarContext);

	/** Hide the fallback once the image has loaded successfully. */
	if (status === 'loaded') return null;

	const fallbackColor = stringToColor({ value: String(props.children ?? ''), type: 'bg', colors });

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
