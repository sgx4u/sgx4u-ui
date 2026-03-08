import { ReactNode } from 'react';
import { Control } from 'react-hook-form';

import { IconsPropsType } from '../../elements/icons';
import { InputPropsType } from '../../elements/input';
import { LabelPropsType } from '../../elements/label';

export type InputModulePropsType = Omit<InputPropsType, 'name'> & {
	label?: LabelPropsType['children'];
	labelClassName?: LabelPropsType['className'];

	message?: string;
	messageClassName?: string;
	state?: InputPropsType['state'];

	innerElement?: ReactNode;
	passwordIconClassName?: string;
	containerClassName?: string;

	labelProps?: Omit<LabelPropsType, 'children' | 'className'>;
	passwordIconProps?: IconsPropsType;
} &
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(| { control?: Control<any>; name?: string }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		| { control: Control<any>; name: string }
	);
