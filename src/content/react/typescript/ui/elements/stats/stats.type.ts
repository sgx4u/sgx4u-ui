import { ReactNode } from 'react';

import { ContainerPropsType } from '../container';

/** Direction a stats metric's trend is moving in. */
export type StatsTrendType = 'up' | 'down' | 'neutral';

/** Stats props type. */
export type StatsPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Label describing what the value represents. */
	label: ReactNode;

	/** The primary value to display. */
	value: ReactNode;

	/** Supporting text shown below the value. */
	helperText?: ReactNode;

	/** Direction the value is trending in. */
	trend?: StatsTrendType;

	/** Value to display next to the trend icon (e.g. "+12%"). */
	trendValue?: ReactNode;
};
