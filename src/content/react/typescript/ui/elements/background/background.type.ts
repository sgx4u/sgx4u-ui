import { ContainerPropsType } from '../container';

/** Background props type. Default - bg-gradient. */
export type BackgroundPropsType =
	| ({ variant: 'bg-gradient' } & BackgroundGradientPropsType)
	| ({ variant: 'pulse' } & GradientPulsePropsType);

/** Props type for the BackgroundGradient component. */
export type BackgroundGradientPropsType = ContainerPropsType & {
	/** Colors in Tailwind CSS to be used for the background gradient. */
	colors?: Array<string>;

	/** Interval in milliseconds to change the color of the background. Default - 2000. */
	interval?: number;
};

/** Props type for the GradientPulse component. */
export type GradientPulsePropsType = ContainerPropsType & {
	/** Color sets in Tailwind CSS each pulse circle cycles through. */
	itemColors?: Array<Array<string>>;

	/** Positions in Tailwind CSS for each pulse circle. */
	itemPositions?: Array<string>;

	/** Interval in milliseconds to change the color of the items. Default - 2000. */
	interval?: number;

	/** Props to be passed to the pulse circle. */
	pulseCircleProps?: Omit<ContainerPropsType, 'as'> & {
		/** HTML element to render as. Default - span. */
		as?: ContainerPropsType['as'];
	};
};
