import { ContainerPropsType } from '../container';

/** Props type for the AspectRatio component. */
export type AspectRatioPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Aspect ratio value. Must be a positive finite number. */
	ratio: number;

	/** HTML element to render as. Default - div. */
	as?: ContainerPropsType['as'];
};
