import { ButtonPropsType } from '../button';

/** Screen corner (or edge-center) the button anchors to. */
export type FloatingActionButtonPositionType =
	| 'bottom-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'top-right'
	| 'top-left';

/** Floating Action Button props type. */
export type FloatingActionButtonPropsType = ButtonPropsType & {
	/** Screen corner (or edge-center) to anchor the button to. Default - bottom-right. */
	position?: FloatingActionButtonPositionType;

	/** Distance in pixels from the anchored edges. Default - 24. */
	offset?: number;
};
