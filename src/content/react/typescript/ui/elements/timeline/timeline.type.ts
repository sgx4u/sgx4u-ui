import { ContainerPropsType } from '../container';

/** Timeline state type. */
export type TimelineStateType = {
	id: string;
	index: number;
	status: 'completed' | 'active' | 'pending' | 'error';
};

/** Timeline orientation type. */
export type TimelineOrientationType = 'vertical' | 'vertical-reverse' | 'horizontal' | 'horizontal-reverse';

/** Timeline context props type. */
export type TimelineContextPropsType = {
	/** Timeline uid. */
	timelineUid: string;

	/** Timeline orientation. */
	orientation: TimelineOrientationType;

	/** Timeline step variant. */
	variant: 'default' | 'content' | 'outlined';

	/** Timeline step size. */
	size: 'xs' | 'sm' | 'default' | 'lg' | 'xl';

	/** Progress index. */
	timelineState: TimelineStateType[];

	/** Set timeline state. */
	handleTimelineStateChange: (timelineState: TimelineStateType) => void;

	/** Register a timeline item or connector for progress index change. */
	registerItem: (element: HTMLElement) => TimelineStateType | null;
};

/** Timeline props type. */
export type TimelinePropsType = Omit<ContainerPropsType, 'as'> & {
	/** Timeline orientation. Default - vertical. */
	orientation?: TimelineOrientationType;

	/** Timeline state. */
	timelineState?: TimelineStateType[];

	/** Default progress index. */
	defaultTimelineState?: TimelineStateType[];

	/** Set progress index. */
	onTimelineStateChange?: (timelineState: TimelineStateType) => void;

	/** Container variant. Default - div. */
	as?: ContainerPropsType['as'];

	/** Timeline step variant. Default - default. */
	variant?: 'default' | 'content' | 'outlined';

	/** Timeline step size. Default - default. */
	size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
};

/** Timeline item context props type. */
export type TimelineItemContextPropsType = {
	/** Item index. */
	index: number;

	/** Item status. */
	status: TimelineStateType['status'];
};

/** Timeline item props type. */
export type TimelineItemPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Container variant. Default - div. */
	as?: ContainerPropsType['as'];
};

/** Timeline step props type. */
export type TimelineStepPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Container variant. Default - div. */
	as?: ContainerPropsType['as'];
};

/** Timeline content props type. */
export type TimelineContentPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Container variant. Default - div. */
	as?: ContainerPropsType['as'];
};

/** Timeline connector props type. */
export type TimelineConnectorPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Container variant. Default - div. */
	as?: ContainerPropsType['as'];
};
