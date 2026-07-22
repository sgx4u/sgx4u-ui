import { ComponentPropsWithRef, ReactNode } from 'react';

import { LabelVariantTypes } from './Label';

/** Props type for the Label component. */
export type LabelPropsType = ComponentPropsWithRef<'label'> & {
	/** Whether the label renders its child as the label element. */
	asChild?: boolean;

	/** Whether the label is required. */
	required?: boolean;

	/** Required indicator. Default - <StarIndicator />. */
	requiredIndicator?: ReactNode;

	/** Label variant style. Default - default. */
	variant?: typeof LabelVariantTypes.variant;

	/** Label size variant. Default - default. */
	size?: typeof LabelVariantTypes.size;

	/** Whether label is disabled. Default - false. */
	disabled?: boolean;

	/** Label helper / message text. */
	message?: string;

	/** Label state. Default - default. */
	state?: typeof LabelVariantTypes.state;
};
