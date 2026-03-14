import { ContainerPropsType } from '../container';
import { TextPropsType } from '../text';

/** Props type for the Card component. */
export type CardPropsType = ContainerPropsType & {
	/** Variant of the card. Default - default. */
	variant?: 'default' | 'outline' | 'glass' | 'liquid';
};

/** Props type for the CardHeader component. */
export type CardTitlePropsType = TextPropsType;

/** Props type for the CardDescription component. */
export type CardDescriptionPropsType = TextPropsType;

/** Props type for the CardContent component. */
export type CardContentPropsType = ContainerPropsType;

/** Props type for the CardFooter component. */
export type CardFooterPropsType = ContainerPropsType;
