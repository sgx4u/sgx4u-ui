import { AvatarFallbackPropsType, AvatarImagePropsType, AvatarPropsType } from '../../elements/avatar';

/** Avatar module props type. */
export type AvatarModulePropsType = {
	/** Source of the avatar image. */
	src: AvatarImagePropsType['src'];

	/** Alt text of the avatar image. */
	alt: AvatarImagePropsType['alt'];

	/** Class name of the avatar image. */
	imageClassName?: AvatarImagePropsType['className'];

	/** Fallback text of the avatar. */
	fallback: AvatarFallbackPropsType['children'];

	/** Class name of the avatar fallback. */
	fallbackClassName?: AvatarFallbackPropsType['className'];

	/** Class name of the avatar. */
	className?: AvatarPropsType['className'];

	/** Props for the avatar. */
	avatarProps?: Omit<AvatarPropsType, 'title' | 'className'>;

	/** Props for the avatar image. */
	avatarImageProps?: Omit<AvatarImagePropsType, 'src' | 'alt' | 'className'>;

	/** Props for the avatar fallback. */
	avatarFallbackProps?: Omit<AvatarFallbackPropsType, 'children' | 'className'>;
};
