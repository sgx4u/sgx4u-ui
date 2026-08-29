import { ContainerPropsType } from '../container';
import { ScrollAreaVariantTypes } from './ScrollArea';

/** Scroll area props type. */
export type ScrollAreaPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Scroll direction(s) to enable. Default - vertical. */
	orientation?: typeof ScrollAreaVariantTypes.orientation;

	/** Additional props applied to the scrolling viewport. */
	viewportProps?: ContainerPropsType;
};
