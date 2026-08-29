import { JSX } from 'react';

import { AvatarModulePropsType } from './avatar-module.type';
import { cn } from '../../utils/styles.util';

import { Avatar, AvatarFallback, AvatarImage } from '../../elements/avatar';

/**
 * @description Composed avatar with image, initials fallback, and stable color derived from the display name.
 * @param {AvatarModulePropsType} props - The props for the AvatarModule component.
 * @returns {JSX.Element} The AvatarModule component.
 */
export function AvatarModule({
	src,
	alt,
	fallback,
	size,
	radius,
	colors,

	className,
	imageClassName,
	fallbackClassName,

	avatarProps,
	avatarImageProps,
	avatarFallbackProps,
}: AvatarModulePropsType): JSX.Element {
	const resolvedAlt = alt ?? fallback;

	return (
		<Avatar {...avatarProps} size={size} radius={radius} title={resolvedAlt} className={cn('group', className)}>
			<AvatarImage
				{...avatarImageProps}
				src={src}
				alt={resolvedAlt}
				className={cn('transition-opacity group-hover:opacity-75', imageClassName)}
			/>

			<AvatarFallback {...avatarFallbackProps} colors={colors} className={cn('text-light', fallbackClassName)}>
				{fallback}
			</AvatarFallback>
		</Avatar>
	);
}
