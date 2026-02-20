import { ContainerPropsType } from '../container';

/** Props type for the Skeleton component. */
export type SkeletonPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Skeleton variant. Default - square. */
	variant?: 'circular' | 'square' | 'rectangular';

	/** Skeleton animation. Default - wave. */
	animation?: 'pulse' | 'wave' | 'none';

	/** HTML element to render as. Default - div. */
	as?: ContainerPropsType['as'];
};
