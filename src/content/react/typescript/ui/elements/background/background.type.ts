import { ContainerPropsType } from '../container';

/** Background props type. Default - bg-gradient. */
export type BackgroundPropsType =
	| ({ variant: 'bg-gradient' } & BackgroundGradientPropsType)
	| ({ variant: 'pulse' } & GradientPulsePropsType);

export type BackgroundGradientPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Colors in Tailwind CSS to be used for the background gradient. */
	colors?: Array<string>;

	/** Interval in milliseconds to change the color of the background. Default - 2000. */
	interval?: number;

	/** HTML element to render as. Default - div. */
	as?: ContainerPropsType['as'];
};

export type GradientPulsePropsType = Omit<ContainerPropsType, 'as'> & {
	/** Item positions in Tailwind CSS to be used for the gradient pulse. */
	itemColors?: Array<Array<string>>;

	/** Item colors in Tailwind CSS to be used for the gradient pulse. */
	itemPositions?: Array<string>;

	/** Interval in milliseconds to change the color of the items. Default - 2000. */
	interval?: number;

	/** HTML element to render as. Default - div. */
	as?: ContainerPropsType['as'];

	/** Props to be passed to the pulse circle. */
	pulseCircleProps?: Omit<ContainerPropsType, 'as'> & {
		/** HTML element to render as. Default - span. */
		as?: ContainerPropsType['as'];
	};
};
