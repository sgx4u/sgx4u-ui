import { RefObject } from 'react';

import { ButtonPropsType } from '../button';
import { LabelPropsType } from '../label';
import { PopoverContentPropsType, PopoverPropsType, PopoverTriggerPropsType } from '../popover';
import { SeparatorPropsType } from '../separator';

/** DropdownMenu context type. */
export type DropdownMenuContextType = {
	/** Whether the dropdown menu is open. */
	open: boolean;

	/** Callback when the open state changes. */
	onOpenChange: (open: boolean) => void;
};

/** DropdownMenuSub context type. */
export type DropdownMenuSubContextType = {
	/** Whether the sub-menu is open. */
	open: boolean;

	/** Callback when the sub-menu open state changes. */
	onOpenChange: (open: boolean) => void;

	/** Ref to the sub-trigger button, used to return focus when closing submenu via ArrowLeft. */
	subTriggerRef?: RefObject<HTMLButtonElement | null>;
};

/** DropdownMenu props type. */
export type DropdownMenuPropsType = PopoverPropsType;

/** DropdownMenuTrigger props type. */
export type DropdownMenuTriggerPropsType = PopoverTriggerPropsType;

/** DropdownMenuContent props type. */
export type DropdownMenuContentPropsType = PopoverContentPropsType;

/** DropdownMenuItem props type. */
export type DropdownMenuItemPropsType = Omit<ButtonPropsType, 'variant' | 'size'> & {
	/** Whether the item should not close the dropdown menu when clicked. */
	doNotCloseOnClick?: boolean;

	/** Visual style of the dropdown menu item. Default - ghost. */
	variant?: ButtonPropsType['variant'];

	/** Size of the dropdown menu item. Default - xs. */
	size?: ButtonPropsType['size'];
};

/** DropdownMenuLabel props type. */
export type DropdownMenuLabelPropsType = LabelPropsType;

/** DropdownMenuSeparator props type. */
export type DropdownMenuSeparatorPropsType = SeparatorPropsType;

/** DropdownMenuSub props type. */
export type DropdownMenuSubPropsType = DropdownMenuPropsType & {
	/** Side the sub-menu opens on. Default - right. */
	side?: PopoverPropsType['side'];

	/** Alignment of the sub-menu relative to the trigger. Default - start. */
	align?: PopoverPropsType['align'];

	/** Offset in pixels from the trigger. Default - 8. */
	sideOffset?: PopoverPropsType['sideOffset'];
};

/** DropdownMenuSubTrigger props type. */
export type DropdownMenuSubTriggerPropsType = DropdownMenuTriggerPropsType;

/** DropdownMenuSubContent props type. */
export type DropdownMenuSubContentPropsType = PopoverContentPropsType;
