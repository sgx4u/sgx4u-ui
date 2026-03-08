import { JSX } from 'react';

import { AvatarModulePropsType } from './avatar-module.type';
import { stringToNumber } from '../../utils/string.util';
import { cn } from '../../utils/styles.util';

import { BG_COLORS } from '../../constants/color.constant';

import { Avatar, AvatarFallback, AvatarImage } from '../../elements/avatar';

/**
 * @description An image element with a fallback for representing the user.
 * @param {AvatarModulePropsType} props - The properties object.
 * @returns {JSX.Element} The AvatarModule component.
 */
export const AvatarModule = ({
	src,
	alt,
	imageClassName,
	fallback,
	fallbackClassName,
	className,

	avatarProps,
	avatarImageProps,
	avatarFallbackProps,
}: AvatarModulePropsType): JSX.Element => {
	const avatarBgColors = BG_COLORS[stringToNumber(String(fallback)) % BG_COLORS.length];

	const avatarFallbackText = String(fallback)
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2);

	return (
		<Avatar
			title={alt}
			className={cn('group flex size-10 shrink-0 overflow-hidden rounded-full bg-muted', className)}
			{...avatarProps}
		>
			<AvatarImage
				src={src}
				alt={alt}
				className={cn('aspect-square size-full transition-all group-hover:opacity-75', imageClassName)}
				{...avatarImageProps}
			/>

			<AvatarFallback
				className={cn(
					'flex size-full items-center justify-center rounded-full bg-muted font-medium text-light',
					avatarBgColors,
					fallbackClassName,
				)}
				{...avatarFallbackProps}
			>
				{avatarFallbackText}
			</AvatarFallback>
		</Avatar>
	);
};
