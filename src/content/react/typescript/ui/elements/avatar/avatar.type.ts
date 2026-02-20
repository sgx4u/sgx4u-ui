import { ContainerPropsType } from '../container';
import { ImagePropsType } from '../image';
import { TextPropsType } from '../text';

/** Context type for the Avatar component. */
export type AvatarContextType = {
	/** Whether an image component exists. Default - false. */
	hasImage: boolean;

	/** Callback when the image component mounts. */
	setHasImage: (has: boolean) => void;

	/** Whether the image has failed to load. Default - false. */
	imageError: boolean;

	/** Callback when the image fails to load. */
	setImageError: (error: boolean) => void;
};

/** Props type for the Avatar component. */
export type AvatarPropsType = Omit<ContainerPropsType, 'radius' | 'as'> & {
	/** Size of the avatar. Default - default. */
	size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';

	/** Radius of the avatar. Default - full. */
	radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

	/** HTML element to render as. Default - div. */
	as?: ContainerPropsType['as'];
};

/** Props type for the AvatarImage component. */
export type AvatarImagePropsType = ImagePropsType;

/** Props type for the AvatarFallback component. */
export type AvatarFallbackPropsType = Omit<TextPropsType, 'as'> & {
	/** Colors in Tailwind CSS classes to use for the fallback. */
	colors?: Array<string>;

	/** HTML element to render as. Default - span. */
	as?: TextPropsType['as'];
};
