import { ContainerPropsType } from '../container';
import { TimelineStepVariantTypes } from './Timeline';

/** Timeline state type. */
export type TimelineStateType = {
	id: string;
	index: number;
	status: typeof TimelineStepVariantTypes.status;
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
	variant: typeof TimelineStepVariantTypes.variant;

	/** Timeline step size. */
	size: typeof TimelineStepVariantTypes.size;

	/** Progress index. */
	timelineState: TimelineStateType[];

	/** Set timeline state. */
	handleTimelineStateChange: (timelineState: TimelineStateType) => void;

	/** Register a timeline item or connector for progress index change. */
	registerItem: (element: HTMLElement) => TimelineStateType | null;
};

/** Timeline props type. */
export type TimelinePropsType = ContainerPropsType & {
	/** Timeline orientation. Default - vertical. */
	orientation?: TimelineOrientationType;

	/** Timeline state. */
	timelineState?: TimelineStateType[];

	/** Default progress index. */
	defaultTimelineState?: TimelineStateType[];

	/** Set progress index. */
	onTimelineStateChange?: (timelineState: TimelineStateType) => void;

	/** Timeline step variant. Default - outlined. */
	variant?: typeof TimelineStepVariantTypes.variant;

	/** Timeline step size. Default - default. */
	size?: typeof TimelineStepVariantTypes.size;
};

/** Timeline item context props type. */
export type TimelineItemContextPropsType = {
	/** Item index. */
	index: number;

	/** Item status. */
	status: TimelineStateType['status'];
};

/** Timeline item props type. */
export type TimelineItemPropsType = ContainerPropsType;

/** Timeline step props type. */
export type TimelineStepPropsType = ContainerPropsType;

/** Timeline content props type. */
export type TimelineContentPropsType = ContainerPropsType;

/** Timeline connector props type. */
export type TimelineConnectorPropsType = ContainerPropsType;
