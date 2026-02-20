import { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';

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

	/** Selected children. */
	selectedChildren: Array<{ id: string; element: ReactNode }>;

	/** Set selected children. */
	setSelectedChildren: Dispatch<SetStateAction<Array<{ id: string; element: ReactNode }>>>;

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
	selectedChildren: Array<{ id: string; element: ReactNode }>;

	/** Set selected children. */
	setSelectedChildren: Dispatch<SetStateAction<Array<{ id: string; element: ReactNode }>>>;

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
export type SelectTriggerPropsType = PopoverTriggerPropsType;

/** Select content props type. */
export type SelectContentPropsType = PopoverContentPropsType;

/** Select item props type. */
export type SelectItemPropsType = ButtonPropsType & {
	/** Item value. */
	value: string;
};

/** Select search props type. */
export type SelectSearchPropsType = InputPropsType;
