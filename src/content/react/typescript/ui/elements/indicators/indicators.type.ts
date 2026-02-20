import { ContainerPropsType } from '../container';

/** Indicators props type. */
export type IndicatorsPropsType = { variant: 'star' } & StarIndicatorPropsType;

/** Props type for the StarIndicator component. */
export type StarIndicatorPropsType = Omit<ContainerPropsType, 'as'> & {
	/** HTML element to render as. Default - span. */
	as?: ContainerPropsType['as'];
};
