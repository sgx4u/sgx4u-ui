import { HTMLAttributes, ReactNode, Ref } from 'react';

/** Props accepted by the Slot component. */
export type SlotPropsType = HTMLAttributes<HTMLElement> & {
	/** Ref forwarded and composed onto the slotted child element. */
	ref?: Ref<HTMLElement>;

	/** Single React element child that receives the merged props. */
	children?: ReactNode;
};
