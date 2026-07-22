import { ContainerPropsType } from '../container';
import { TextPropsType } from '../text';
import { CardVariantTypes } from './Card';

/** Props type for the Card component. */
export type CardPropsType = ContainerPropsType & {
	/** Variant of the card. Default - default. */
	variant?: typeof CardVariantTypes.variant;

	/** Size of the card. Default - default. */
	size?: typeof CardVariantTypes.size;

	/** Border radius of the card. Default - lg. */
	radius?: typeof CardVariantTypes.radius;
};

/** Props type for the CardHeader component. */
export type CardTitlePropsType = Omit<TextPropsType, 'as'> & {
	/** HTML element to render as. Default - h6. */
	as?: TextPropsType['as'];
};

/** Props type for the CardDescription component. */
export type CardDescriptionPropsType = TextPropsType;

/** Props type for the CardContent component. */
export type CardContentPropsType = ContainerPropsType;

/** Props type for the CardFooter component. */
export type CardFooterPropsType = ContainerPropsType;
