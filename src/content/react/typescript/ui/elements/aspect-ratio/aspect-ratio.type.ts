import { ContainerPropsType } from '../container';

/** Props type for the AspectRatio component. */
export type AspectRatioPropsType = ContainerPropsType & {
	/** Aspect ratio value. Must be a positive finite number. */
	ratio: number;
};
