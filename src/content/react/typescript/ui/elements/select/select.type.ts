import { Dispatch, ReactElement, ReactNode, RefObject, SetStateAction } from 'react';
import { LucideProps } from 'lucide-react';

import { ButtonPropsType } from '../button';
import { InputPropsType } from '../input';
import { PopoverContentPropsType, PopoverPropsType, PopoverTriggerPropsType } from '../popover';

/** Select context type. */
export type SelectContextType = {
	/** Select value. */
	value: Array<string>;

	/** On value change callback. */
	onValueChange: (value: Array<string>) => void;

	/** Whether select is open. */
	open: boolean;

	/** Set select open state. */
	onOpenChange: (open: boolean) => void;

	/** Selected children (SelectItem elements for trigger display). */
	selectedChildren: Array<ReactElement<SelectItemPropsType>>;

	/** Select type. Default - single. */
	type: SelectPropsType['type'];

	/** Track if select was opened via keyboard. */
	openedViaKeyboard: RefObject<boolean>;
};

/** Select props type. */
export type SelectPropsType = Omit<PopoverPropsType, 'open' | 'onOpenChange'> & {
	/** Select value. */
	value?: Array<string>;

	/** Select default value. */
	defaultValue?: Array<string>;

	/** On value change callback. */
	onValueChange?: (value: Array<string>) => void;

	/** Select open state. */
	open?: boolean;

	/** On open change callback. */
	onOpenChange?: (open: boolean) => void;

	/** Select type. Default - single. */
	type?: 'single' | 'multiple';
};

/** A selected child entry tracked for the searchable select trigger display. */
export type SelectWithSearchSelectedChildType = {
	/** Unique id of the selected item, matching its value. */
	id: string;

	/** Rendered label element shown in the trigger. */
	element: ReactNode;
};

/** Select with search context type. */
export type SelectWithSearchContextType = {
	/** Select value. */
	value: Array<string>;

	/** On value change callback. */
	onValueChange: (value: Array<string>) => void;

	/** Whether select is open. */
	open: boolean;

	/** Set select open state. */
	onOpenChange: (open: boolean) => void;

	/** Selected children. */
	selectedChildren: Array<SelectWithSearchSelectedChildType>;

	/** Set selected children. */
	setSelectedChildren: Dispatch<SetStateAction<Array<SelectWithSearchSelectedChildType>>>;

	/** Select type. Default - single. */
	type: SelectPropsType['type'];

	/** Search term. */
	searchTerm: string;

	/** Set search term. */
	setSearchTerm: Dispatch<SetStateAction<string>>;

	/** On add select item callback. */
	onAddSelectItem?: (item: string) => void;
};

/** Select with search props type. */
export type SelectWithSearchPropsType = SelectPropsType & {
	/** On add select item callback. */
	onAddSelectItem?: (item: string) => void;
};

/** Select trigger props type. */
export type SelectTriggerPropsType = PopoverTriggerPropsType & {
	/** Class name for the arrow icon. */
	arrowClassName?: string;

	/** Props for the arrow icon. */
	arrowProps?: LucideProps;
};

/** Select content props type. */
export type SelectContentPropsType = PopoverContentPropsType;

/** Select item props type. */
export type SelectItemPropsType = ButtonPropsType & {
	/** Item value. */
	value: string;
};

/** Select search props type. */
export type SelectSearchPropsType = InputPropsType;
