import { ReactNode } from 'react';

import { ContainerPropsType } from '../container';
import { TextPropsType } from '../text';
import { TooltipVariantTypes } from './Tooltip';

/** Tooltip props type. */
export type TooltipPropsType = Omit<TextPropsType, 'content' | 'variant'> & {
	/** Tooltip content. */
	content?: ReactNode;

	/** Tooltip side. Default - top. */
	side?: typeof TooltipVariantTypes.side;

	/** Tooltip trigger. Default - hover. */
	trigger?: 'hover' | 'click' | 'focus';

	/** Tooltip delay. Default - 100. */
	delay?: number;

	/** Tooltip offset. Side = top or bottom, Default - 12. Side = left or right, Default - 15. */
	offset?: number;

	/** Tooltip open state. */
	open?: boolean;

	/** Tooltip open change handler. */
	onOpenChange?: (open: boolean) => void;

	/** Tooltip variant. Default - default. */
	variant?: typeof TooltipVariantTypes.variant;

	/** Tooltip size. Default - default. */
	size?: typeof TooltipVariantTypes.size;

	/** Tooltip container props. */
	containerProps?: ContainerPropsType;
};
