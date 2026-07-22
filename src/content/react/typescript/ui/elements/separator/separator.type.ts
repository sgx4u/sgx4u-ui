import { ContainerPropsType } from '../container';
import { SeparatorVariantTypes } from './Separator';

/** Props type for the Separator component. */
export type SeparatorPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Separator orientation. Default - horizontal. */
	orientation?: typeof SeparatorVariantTypes.orientation;

	/** Whether the separator is purely decorative and hidden from the accessibility tree as a separator. Default - false. */
	decorative?: boolean;

	/** Separator variant. Default - default. */
	variant?: typeof SeparatorVariantTypes.variant;

	/** Separator thickness. Default - default. */
	thickness?: typeof SeparatorVariantTypes.thickness;

	/** HTML element to render as. Default - span. */
	as?: ContainerPropsType['as'];
};
