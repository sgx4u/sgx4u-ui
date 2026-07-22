import { ContainerPropsType } from '../container';
import { ImagePropsType } from '../image';
import { TextPropsType } from '../text';
import { AvatarVariantTypes } from './Avatar';

/** Loading status of the avatar image, shared between the image and fallback. */
export type AvatarImageStatusType = 'idle' | 'loaded' | 'error';

/** Context type for the Avatar component. */
export type AvatarContextType = {
	/** Current loading status of the avatar image. Default - idle. */
	status: AvatarImageStatusType;

	/** Updates the loading status of the avatar image. */
	setStatus: (status: AvatarImageStatusType) => void;
};

/** Props type for the Avatar component. */
export type AvatarPropsType = ContainerPropsType & {
	/** Size of the avatar. Default - default. */
	size?: typeof AvatarVariantTypes.size;

	/** Radius of the avatar. Default - full. */
	radius?: typeof AvatarVariantTypes.radius;
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
