import { ReactNode } from 'react';
import { Control, FieldValues } from 'react-hook-form';

import { IconsPropsType } from '../../elements/icons';
import { InputPropsType } from '../../elements/input';
import { LabelPropsType } from '../../elements/label';

/** Shared props for the input module. */
type InputModuleBasePropsType = Omit<InputPropsType, 'name'> & {
	/** Label content rendered above the input. */
	label?: LabelPropsType['children'];

	/** Class name applied to the label. */
	labelClassName?: LabelPropsType['className'];

	/** Helper or validation message rendered below the input. */
	message?: string;

	/** Class name applied to the message. */
	messageClassName?: string;

	/** Optional element rendered inside the input wrapper, such as an adornment. */
	innerElement?: ReactNode;

	/** Class name applied to the password visibility icon. */
	passwordIconClassName?: string;

	/** Class name applied to the outer module container. */
	containerClassName?: string;

	/** Additional props forwarded to the label. */
	labelProps?: Omit<LabelPropsType, 'children' | 'className' | 'htmlFor' | 'required'>;

	/** Additional props forwarded to the password visibility icon. */
	passwordIconProps?: Omit<
		IconsPropsType,
		'variant' | 'visible' | 'defaultVisible' | 'onVisibleChange' | 'className'
	>;
};

/** Input module props type. */
export type InputModulePropsType = InputModuleBasePropsType &
	(
		| {
				/** Optional field name when used without react-hook-form. */
				name?: string;

				/** Not used in uncontrolled mode. */
				control?: never;
		  }
		| {
				/** react-hook-form control instance. */
				control: Control<FieldValues>;

				/** Field name registered with react-hook-form. */
				name: string;
		  }
	);
