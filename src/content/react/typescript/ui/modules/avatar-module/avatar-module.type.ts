import { AvatarFallbackPropsType, AvatarImagePropsType, AvatarPropsType } from '../../elements/avatar';

/** Avatar module props type. */
export type AvatarModulePropsType = {
	/** Source of the avatar image. */
	src?: AvatarImagePropsType['src'];

	/** Alt text of the avatar image. Defaults to "fallback". */
	alt?: AvatarImagePropsType['alt'];

	/** Display name used for initials and the stable fallback color. */
	fallback: string;

	/** Size of the avatar. Default - default. */
	size?: AvatarPropsType['size'];

	/** Radius of the avatar. Default - full. */
	radius?: AvatarPropsType['radius'];

	/** Background colors in Tailwind CSS classes to use for the fallback. */
	colors?: AvatarFallbackPropsType['colors'];

	/** Class name of the avatar. */
	className?: AvatarPropsType['className'];

	/** Class name of the avatar image. */
	imageClassName?: AvatarImagePropsType['className'];

	/** Class name of the avatar fallback. */
	fallbackClassName?: AvatarFallbackPropsType['className'];

	/** Props for the avatar. */
	avatarProps?: Omit<AvatarPropsType, 'size' | 'radius' | 'className' | 'title'>;

	/** Props for the avatar image. */
	avatarImageProps?: Omit<AvatarImagePropsType, 'src' | 'alt' | 'className'>;

	/** Props for the avatar fallback. */
	avatarFallbackProps?: Omit<AvatarFallbackPropsType, 'children' | 'className' | 'colors'>;
};
