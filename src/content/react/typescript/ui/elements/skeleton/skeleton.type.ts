import { ContainerPropsType } from '../container';
import { SkeletonVariantTypes } from './Skeleton';

/** Props type for the Skeleton component. */
export type SkeletonPropsType = ContainerPropsType & {
	/** Skeleton variant. Default - circular. */
	variant?: typeof SkeletonVariantTypes.variant;

	/** Skeleton animation. Default - wave. */
	animation?: typeof SkeletonVariantTypes.animation;
};
