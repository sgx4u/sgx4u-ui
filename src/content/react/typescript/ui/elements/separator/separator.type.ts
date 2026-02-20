import { ContainerPropsType } from '../container';

/** Props type for the Separator component. */
export type SeparatorPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Separator orientation. Default - horizontal. */
	orientation?: 'horizontal' | 'vertical';

	/** Separator variant. Default - default. */
	variant?: 'default' | 'dashed' | 'gradient';

	/** Separator thickness. Default - default. */
	thickness?: 'thin' | 'default' | 'thick';

	/** HTML element to render as. Default - span. */
	as?: ContainerPropsType['as'];
};
