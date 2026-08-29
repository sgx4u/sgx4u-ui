'use client';

import {
	createContext,
	CSSProperties,
	JSX,
	ReactNode,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react';
import { CheckIcon, LoaderIcon, XIcon } from 'lucide-react';

import {
	TimelineConnectorPropsType,
	TimelineContentPropsType,
	TimelineContextPropsType,
	TimelineItemContextPropsType,
	TimelineItemPropsType,
	TimelinePropsType,
	TimelineStateType,
	TimelineStepPropsType,
} from './timeline.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';

/** Context for the Timeline component. */
const TimelineContext = createContext<TimelineContextPropsType>({
	timelineUid: '',
	orientation: 'vertical',
	variant: 'outlined',
	size: 'default',
	timelineState: [],
	handleTimelineStateChange: () => {},
	registerItem: () => null,
});

/**
 * @description Visual representation of a sequence of events or steps in a process.
 * @returns {JSX.Element} The Timeline component.
 */
export function Timeline({
	orientation = 'vertical',
	timelineState,
	defaultTimelineState,
	onTimelineStateChange,

	variant = 'outlined',
	size = 'default',
	className,

	...props
}: TimelinePropsType): JSX.Element {
	/** Internal timeline state when timelineState is not provided. */
	const [internalTimelineState, setInternalTimelineState] = useState(timelineState ?? defaultTimelineState ?? []);

	/** Controlled + Uncontrolled sync. */
	const currentTimelineState = timelineState ?? internalTimelineState;
	/** Unique identifier to identify the timeline element. */
	const timelineUid = useId();

	const handleTimelineStateChange = (newTimelineState: TimelineStateType): void => {
		onTimelineStateChange?.(newTimelineState);

		/** Only manage internal state when uncontrolled. */
		if (timelineState !== undefined) return;

		setInternalTimelineState((previousState) => {
			const existingIndex = previousState.findIndex((state) => state.id === newTimelineState.id);

			/** Append when new, otherwise replace the existing entry. */
			if (existingIndex === -1) return [...previousState, newTimelineState];

			const updatedState = [...previousState];
			updatedState[existingIndex] = newTimelineState;
			return updatedState;
		});
	};

	const registerItem = (element: HTMLElement): TimelineStateType | null => {
		/** If the element is already registered, return. */
		if (element.getAttribute('data-id')) return null;

		const timeline = document.querySelector(`[data-uid="${timelineUid}"][data-slot="timeline"]`);
		if (!timeline) return null;

		/** Get all the child elements. */
		const items = Array.from(timeline.querySelectorAll('[data-slot="timeline-item"]'));

		/** Get the index and type of the element. */
		const index = items.findIndex((item) => item === element);
		const type = element.dataset.slot === 'timeline-item' ? 'item' : 'connector';

		/** Generate a new element id to uniquely identify the element. */
		const newElementId = type === 'item' ? `timeline-item-${index}` : `timeline-connector-${index}`;
		element.setAttribute('data-id', newElementId);

		handleTimelineStateChange({ id: newElementId, index, status: 'pending' });
		return { id: newElementId, index, status: 'pending' };
	};

	return (
		<TimelineContext.Provider
			value={{
				timelineUid,
				orientation,
				variant,
				size,
				timelineState: currentTimelineState,
				handleTimelineStateChange,
				registerItem,
			}}
		>
			<Container
				{...props}
				className={cn('flex', ['vertical', 'vertical-reverse'].includes(orientation) && 'flex-col', className)}
				data-slot="timeline"
				data-uid={timelineUid}
				role="list"
			/>
		</TimelineContext.Provider>
	);
}

/** Context for the TimelineItem component. */
const TimelineItemContext = createContext<TimelineItemContextPropsType>({
	index: 0,
	status: 'pending',
});

/** Variants for the TimelineItem component. */
const { variants: timelineItemVariants } = makeVariants({
	base: 'relative flex gap-3',
	variants: {
		orientation: {
			vertical: 'flex-row',
			horizontal: 'flex-col-reverse items-center',
			'vertical-reverse': 'flex-row-reverse',
			'horizontal-reverse': 'flex-col items-center',
		},
	},
	default: {
		orientation: 'vertical',
	},
});

/**
 * @description Single timeline item with step indicator and content.
 * @returns {JSX.Element} The TimelineItem component.
 */
export function TimelineItem({ className, ...props }: TimelineItemPropsType): JSX.Element {
	const { orientation, timelineUid, registerItem, timelineState } = useContext(TimelineContext);

	const [itemIndex, setItemIndex] = useState(0);
	const [itemStatus, setItemStatus] = useState<TimelineStateType['status']>('pending');

	/** This item data id reference. */
	const itemDataIdRef = useRef<string | undefined>(undefined);

	/** Unique identifier to identify the timeline item element. */
	const timelineItemUid = useId();

	/** Register the item element. */
	useEffect(() => {
		/** If the item element is not found, return. */
		const item = document.querySelector(
			`[data-item-uid="${timelineItemUid}"][data-slot="timeline-item"]`,
		) as HTMLElement | null;
		if (!item) return;

		const registeredItem = registerItem(item);
		if (!registeredItem) return;

		itemDataIdRef.current = item.dataset.id;

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setItemIndex(registeredItem.index);
		setItemStatus(registeredItem.status);
	}, [registerItem, timelineItemUid]);

	/** Check the status of the item. */
	useEffect(() => {
		if (!itemDataIdRef.current) return;
		const itemStatus = timelineState.find((state) => state.id === itemDataIdRef.current)?.status ?? 'pending';
		setItemStatus(itemStatus);
	}, [timelineState]);

	return (
		<TimelineItemContext.Provider value={{ index: itemIndex, status: itemStatus }}>
			<Container
				{...props}
				className={cn(timelineItemVariants({ orientation }), className)}
				data-slot="timeline-item"
				data-uid={timelineUid}
				data-item-uid={timelineItemUid}
				role="listitem"
				aria-posinset={itemIndex + 1}
				aria-setsize={timelineState.length}
				aria-current={itemStatus === 'active' ? 'step' : undefined}
			/>
		</TimelineItemContext.Provider>
	);
}

/** Variants for the TimelineStep component. */
export const { variants: timelineStepVariants, types: TimelineStepVariantTypes } = makeVariants({
	base: 'flex items-center justify-center rounded-full transition-all',
	variants: {
		variant: {
			default: 'before:hidden',
			outlined: `relative border-2 before:absolute before:inset-0 before:m-auto before:rounded-full before:bg-muted-foreground`,
			content: 'border-2 before:hidden',
		},
		size: {
			xs: 'size-4 text-xs before:size-2',
			sm: 'size-5 text-xs before:size-2.5',
			default: 'size-6 text-sm before:size-3',
			lg: 'size-7 text-base before:size-3.5',
			xl: 'size-8 text-base before:size-4',
		},
		status: {
			pending: '',
			active: '',
			completed: '',
			danger: '',
		},
	},
	conditionals: [
		{ when: { variant: 'default', status: 'pending' }, apply: 'bg-muted' },
		{ when: { variant: 'default', status: 'active' }, apply: 'bg-primary' },
		{ when: { variant: 'default', status: 'completed' }, apply: 'bg-success' },
		{ when: { variant: 'default', status: 'danger' }, apply: 'bg-danger' },
		{
			when: { variant: ['outlined', 'content'], status: 'pending' },
			apply: 'border-muted text-muted-dark before:bg-muted',
		},
		{
			when: { variant: ['outlined', 'content'], status: 'active' },
			apply: 'border-primary text-foreground before:bg-primary',
		},
		{
			when: { variant: ['outlined', 'content'], status: 'completed' },
			apply: 'border-success text-success before:bg-success',
		},
		{
			when: { variant: ['outlined', 'content'], status: 'danger' },
			apply: 'border-danger text-danger before:bg-danger',
		},
	],
	default: {
		variant: 'default',
		size: 'default',
		status: 'pending',
	},
});

/**
 * @description Timeline step with step indicator and content.
 * @returns {JSX.Element} The TimelineStep component.
 */
export function TimelineStep({
	className,

	children,
	...props
}: TimelineStepPropsType): JSX.Element {
	const { timelineUid, variant, size } = useContext(TimelineContext);
	const { index, status } = useContext(TimelineItemContext);

	const getIcon = (): ReactNode => {
		switch (status) {
			case 'active':
				return <LoaderIcon className="size-4 animate-spin motion-reduce:animate-none" />;
			case 'completed':
				return <CheckIcon className="size-4" />;
			case 'danger':
				return <XIcon className="size-4" />;
			default:
				return (
					<Container as="span" className="font-medium">
						{index + 1}
					</Container>
				);
		}
	};

	return (
		<Container
			role="img"
			aria-label={`Timeline step ${index + 1} is ${status}`}
			{...props}
			className={cn(
				'relative z-10 shrink-0',
				typeof children === 'undefined' && timelineStepVariants({ size, variant, status }),
				className,
			)}
			data-slot="timeline-step"
			data-uid={timelineUid}
			data-id={`timeline-step-${index}`}
		>
			{children ?? (variant === 'content' ? getIcon() : null)}
		</Container>
	);
}

/**
 * @description Timeline content container.
 * @returns {JSX.Element} The TimelineContent component.
 */
export function TimelineContent({ className, ...props }: TimelineContentPropsType): JSX.Element {
	const { orientation, timelineUid } = useContext(TimelineContext);
	const { index } = useContext(TimelineItemContext);

	return (
		<Container
			{...props}
			className={cn('flex flex-col', orientation === 'horizontal' ? 'text-center' : 'text-start', className)}
			data-slot="timeline-content"
			data-uid={timelineUid}
			data-id={`timeline-content-${index}`}
		/>
	);
}

/**
 * @description Connector line that connects two timeline items.
 * @returns {JSX.Element} The TimelineConnector component.
 */
export function TimelineConnector({ className, ...props }: TimelineConnectorPropsType): JSX.Element {
	const { timelineUid, timelineState, orientation } = useContext(TimelineContext);
	const { index: itemIndex } = useContext(TimelineItemContext);

	const [connectorStyles, setConnectorStyles] = useState<CSSProperties>({});

	/** Unique identifier to identify the timeline connector element. */
	const connectorUid = useId();

	const isStepCompleted = useMemo(() => {
		/** Copy before sorting to avoid mutating the shared timeline state. */
		const timelineIndexOrdered = [...timelineState].sort((a, b) => b.index - a.index);
		/** Find the highest index which is completed. */
		const lastIndexWhichIsCompleted = timelineIndexOrdered.find((state) => state.status === 'completed')?.index;

		/** If no completed step is found, return false. */
		if (lastIndexWhichIsCompleted === undefined) return false;
		/** If the current index is at or before the last completed step, mark the connector completed. */
		return itemIndex <= lastIndexWhichIsCompleted;
	}, [timelineState, itemIndex]);

	/** Compute the connector styles. */
	useEffect(() => {
		/** Get the current step element. */
		const currentStepElement = document.querySelector(
			`[data-uid="${timelineUid}"][data-id="timeline-step-${itemIndex}"]`,
		) as HTMLElement | null;
		if (!currentStepElement) return;

		/** Get the next step element. */
		const nextStepElement = document.querySelector(
			`[data-uid="${timelineUid}"][data-id="timeline-step-${itemIndex + 1}"]`,
		) as HTMLElement | null;
		if (!nextStepElement) return;

		/** Identify the timeline item hosting the current step so connector offsets are measured relative to it, accounting for step margins and alignment. */
		const timelineItemElement = currentStepElement.closest('[data-slot="timeline-item"]') as HTMLElement | null;
		if (!timelineItemElement) return;

		const currentRect = currentStepElement.getBoundingClientRect();
		const nextRect = nextStepElement.getBoundingClientRect();
		const timelineItemRect = timelineItemElement.getBoundingClientRect();

		let style: CSSProperties = {};

		if (orientation === 'vertical' || orientation === 'vertical-reverse') {
			/** Bottom edge of the current step relative to the item, so the line starts exactly where the circle ends. */
			const currentStepBottom = currentRect.bottom - timelineItemRect.top;
			/** Top edge of the next step relative to the item, so the line ends exactly where the next circle starts. */
			const nextStepTop = nextRect.top - timelineItemRect.top;
			/** Horizontal center of the current step relative to the item (offset by 1 to center the 2px line). */
			const centerX = currentRect.left - timelineItemRect.left + currentRect.width / 2 - 1;

			style = {
				left: centerX,
				top: currentStepBottom,
				width: 2,
				height: nextStepTop - currentStepBottom,
			};
			/** If the orientation is vertical-reverse, anchor to the right edge instead. */
			if (orientation === 'vertical-reverse') {
				delete style.left;
				style.right = timelineItemRect.right - currentRect.right + currentRect.width / 2 - 1;
			}
		}

		if (orientation === 'horizontal' || orientation === 'horizontal-reverse') {
			/** Determine the absolute center positions for the current and next steps. */
			const currentCenterX = currentRect.left + currentRect.width / 2;
			const nextCenterX = nextRect.left + nextRect.width / 2;
			const widthBetweenCenters = nextCenterX - currentCenterX;
			/** Compute the radius of the current and next steps. */
			const currentRadius = currentRect.width / 2;
			const nextRadius = nextRect.width / 2;
			const segmentWidth = widthBetweenCenters - currentRadius - nextRadius;

			if (segmentWidth <= 0) return;

			/** Compute the center of the current step for vertical placement. */
			const centerY = currentRect.height / 2 - 1;

			style = {
				bottom: centerY,
				/** Start the connector from the outer edge of the current step. */
				left: currentCenterX + currentRadius - timelineItemRect.left,
				/** Span the connector only between the outer edges of both steps. */
				width: segmentWidth,
				height: 2,
			};
			/** If the orientation is horizontal-reverse, reverse the bottom and top styles. */
			if (orientation === 'horizontal-reverse') {
				delete style.bottom;
				style.top = centerY;
			}
		}

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setConnectorStyles(style);
	}, [timelineUid, timelineState, orientation, itemIndex]);

	return (
		<Container
			{...props}
			style={{ ...props.style, ...connectorStyles }}
			className={cn('absolute z-0 shrink-0', isStepCompleted ? 'bg-success' : 'bg-muted', className)}
			data-slot="timeline-connector"
			data-uid={timelineUid}
			data-item-uid={connectorUid}
			role="presentation"
			aria-hidden="true"
		/>
	);
}
