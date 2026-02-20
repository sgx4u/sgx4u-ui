import { ContainerPropsType } from '../container';

/** Props type for the ButtonGroup component. */
export type ButtonGroupPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Button group orientation. Default - horizontal. */
	orientation?: 'horizontal' | 'vertical';

	/** HTML element to render as. Default - div. */
	as?: ContainerPropsType['as'];
};
