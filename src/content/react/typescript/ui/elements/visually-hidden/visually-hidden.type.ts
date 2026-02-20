import { ContainerPropsType } from '../container';

export type VisuallyHiddenPropsType = Omit<ContainerPropsType, 'as'> & {
	/** HTML element to render as. Default - span. */
	as?: ContainerPropsType['as'];
};
