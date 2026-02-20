import { ReactNode } from 'react';

import { ContainerPropsType } from '../container';
import { TextPropsType } from '../text';

/** Tooltip props type. */
export type TooltipPropsType = TextPropsType & {
	/** Tooltip content. */
	content?: ReactNode;

	/** Tooltip side. Default - top. */
	side?: 'top' | 'bottom' | 'left' | 'right';

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
	variant?: 'default' | 'dark' | 'light' | 'success' | 'warn' | 'error';

	/** Tooltip size. Default - default. */
	size?: 'sm' | 'default' | 'lg';

	/** Tooltip container props. */
	containerProps?: ContainerPropsType;
};
