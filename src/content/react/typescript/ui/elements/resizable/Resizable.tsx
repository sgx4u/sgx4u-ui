'use client';

import {
	Children,
	createContext,
	isValidElement,
	JSX,
	KeyboardEvent as ReactKeyboardEvent,
	PointerEvent as ReactPointerEvent,
	useContext,
	useRef,
	useState,
} from 'react';
import { GripVerticalIcon } from 'lucide-react';

import {
	ResizableContextType,
	ResizableHandlePropsType,
	ResizablePanelConstraintsType,
	ResizablePanelGroupPropsType,
	ResizablePanelPropsType,
	ResizablePanelSizeMapType,
} from './resizable.type';
import { cn } from '../../utils/styles.util';
import { pixelsToPercentage, resizeAdjacentPanelPair } from './resizable.helper';

import { Container } from '../container';

/** Keyboard step size in percentage points for arrow keys. */
const RESIZE_KEYBOARD_STEP = 2;

/** Keyboard step size in percentage points for Page Up / Page Down. */
const RESIZE_KEYBOARD_PAGE_STEP = 10;

const ResizableContext = createContext<ResizableContextType | null>(null);

/**
 * @description Accesses the current resizable context, guarding against usage outside a ResizablePanelGroup.
 * @returns {ResizableContextType} The current resizable context.
 */
function useResizableContext(): ResizableContextType {
	const context = useContext(ResizableContext);
	if (!context) throw new Error('Resizable components must be used inside <ResizablePanelGroup>.');
	return context;
}

/**
 * @description Counts ResizablePanel children within a panel group.
 * @param {ResizablePanelGroupPropsType['children']} children - The group children.
 * @returns {number} The number of panel children.
 */
function countResizablePanels(children: ResizablePanelGroupPropsType['children']): number {
	return Children.toArray(children).filter((child) => isValidElement(child) && child.type === ResizablePanel).length;
}

/**
 * @description Container that lays out ResizablePanel and ResizableHandle children along a horizontal or vertical axis, managing each panel's percentage size.
 * @returns {JSX.Element} The ResizablePanelGroup component.
 */
export function ResizablePanelGroup({
	direction = 'horizontal',
	className,
	children,
	...props
}: ResizablePanelGroupPropsType): JSX.Element {
	const [sizes, setSizes] = useState<ResizablePanelSizeMapType>({});
	const constraintsRef = useRef<Record<string, ResizablePanelConstraintsType>>({});
	const panelCount = countResizablePanels(children);

	const registerPanel: ResizableContextType['registerPanel'] = ({ id, defaultSize, minSize, maxSize }) => {
		constraintsRef.current[id] = { minSize, maxSize };

		setSizes((currentSizes) => {
			if (currentSizes[id] !== undefined) return currentSizes;
			return {
				...currentSizes,
				[id]: defaultSize ?? 100 / Math.max(panelCount, 1),
			};
		});
	};

	const resizeAdjacentPanels: ResizableContextType['resizeAdjacentPanels'] = ({
		previousId,
		nextId,
		deltaPercentage,
	}) => {
		setSizes((currentSizes) => {
			const previousConstraints = constraintsRef.current[previousId];
			const nextConstraints = constraintsRef.current[nextId];
			if (!previousConstraints || !nextConstraints) return currentSizes;

			const nextPair = resizeAdjacentPanelPair({
				previousSize: currentSizes[previousId] ?? 0,
				nextSize: currentSizes[nextId] ?? 0,
				deltaPercentage,
				previousMin: previousConstraints.minSize,
				previousMax: previousConstraints.maxSize,
				nextMin: nextConstraints.minSize,
				nextMax: nextConstraints.maxSize,
			});

			if (!nextPair) return currentSizes;
			return { ...currentSizes, [previousId]: nextPair.previousSize, [nextId]: nextPair.nextSize };
		});
	};

	/**
	 * @description Looks up registered constraints for a panel id.
	 * @param {string} id - The panel id.
	 * @returns {ResizablePanelConstraintsType | undefined} The panel constraints, when registered.
	 */
	const getPanelConstraints = (id: string): ResizablePanelConstraintsType | undefined => {
		return constraintsRef.current[id];
	};

	return (
		<ResizableContext.Provider
			value={{ direction, sizes, registerPanel, resizeAdjacentPanels, getPanelConstraints }}
		>
			<Container
				{...props}
				className={cn('flex size-full', direction === 'vertical' && 'flex-col', className)}
				data-slot="resizable-panel-group"
				data-direction={direction}
			>
				{children}
			</Container>
		</ResizableContext.Provider>
	);
}

/**
 * @description A resizable region within a ResizablePanelGroup, sized as a percentage of the group.
 * @returns {JSX.Element} The ResizablePanel component.
 */
export function ResizablePanel({
	id,
	defaultSize,
	minSize = 10,
	maxSize = 90,
	className,
	style,
	...props
}: ResizablePanelPropsType): JSX.Element {
	const { sizes, registerPanel } = useResizableContext();

	/** Register on every render (idempotent) so constraint updates stay current without an extra effect. */
	registerPanel({ id, defaultSize, minSize, maxSize });

	const size = sizes[id];

	return (
		<Container
			{...props}
			style={{ flexBasis: size !== undefined ? `${size}%` : undefined, flexGrow: 0, flexShrink: 0, ...style }}
			className={cn('overflow-auto', className)}
			data-slot="resizable-panel"
			id={id}
		/>
	);
}

/**
 * @description Drag handle placed between two panels that resizes them in tandem via pointer drag or keyboard.
 * @returns {JSX.Element} The ResizableHandle component.
 */
export function ResizableHandle({
	previousPanelId,
	nextPanelId,
	className,
	'aria-label': ariaLabel = 'Resize panels',
	...props
}: ResizableHandlePropsType): JSX.Element {
	const { direction, sizes, resizeAdjacentPanels, getPanelConstraints } = useResizableContext();
	const dragOriginRef = useRef<{ clientPosition: number; groupSizePixels: number } | null>(null);

	const isHorizontal = direction === 'horizontal';
	const previousSize = sizes[previousPanelId] ?? 0;
	const previousConstraints = getPanelConstraints(previousPanelId);
	const valueMin = previousConstraints?.minSize ?? 0;
	const valueMax = previousConstraints?.maxSize ?? 100;

	/**
	 * @description Resizes the adjacent panels by a percentage delta.
	 * @param {number} deltaPercentage - The size change applied to the previous panel.
	 * @returns {void}
	 */
	const applyDelta = (deltaPercentage: number): void => {
		resizeAdjacentPanels({
			previousId: previousPanelId,
			nextId: nextPanelId,
			deltaPercentage,
		});
	};

	/**
	 * @description Starts a pointer drag and captures the pointer for consistent tracking.
	 * @param {ReactPointerEvent<HTMLDivElement>} event - The pointer down event.
	 * @returns {void}
	 */
	const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
		const groupElement = event.currentTarget.closest<HTMLElement>('[data-slot="resizable-panel-group"]');
		if (!groupElement) return;

		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);

		const groupRect = groupElement.getBoundingClientRect();
		dragOriginRef.current = {
			clientPosition: isHorizontal ? event.clientX : event.clientY,
			groupSizePixels: isHorizontal ? groupRect.width : groupRect.height,
		};
	};

	/**
	 * @description Continues an active pointer drag.
	 * @param {ReactPointerEvent<HTMLDivElement>} event - The pointer move event.
	 * @returns {void}
	 */
	const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
		const origin = dragOriginRef.current;
		if (!origin) return;

		const clientPosition = isHorizontal ? event.clientX : event.clientY;
		applyDelta(
			pixelsToPercentage({
				deltaPixels: clientPosition - origin.clientPosition,
				groupSizePixels: origin.groupSizePixels,
			}),
		);

		dragOriginRef.current = { clientPosition, groupSizePixels: origin.groupSizePixels };
	};

	/**
	 * @description Ends an active pointer drag.
	 * @returns {void}
	 */
	const handlePointerUp = (): void => {
		dragOriginRef.current = null;
	};

	/**
	 * @description Handles keyboard resizing for the window splitter pattern.
	 * @param {ReactKeyboardEvent<HTMLDivElement>} event - The keyboard event.
	 * @returns {void}
	 */
	const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
		if (event.key === 'Home') {
			event.preventDefault();
			applyDelta(valueMin - previousSize);
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			applyDelta(valueMax - previousSize);
			return;
		}

		if (event.key === 'PageUp') {
			event.preventDefault();
			applyDelta(-RESIZE_KEYBOARD_PAGE_STEP);
			return;
		}

		if (event.key === 'PageDown') {
			event.preventDefault();
			applyDelta(RESIZE_KEYBOARD_PAGE_STEP);
			return;
		}

		let deltaPercentage = 0;

		if (isHorizontal && event.key === 'ArrowLeft') deltaPercentage = -RESIZE_KEYBOARD_STEP;
		else if (isHorizontal && event.key === 'ArrowRight') deltaPercentage = RESIZE_KEYBOARD_STEP;
		else if (!isHorizontal && event.key === 'ArrowUp') deltaPercentage = -RESIZE_KEYBOARD_STEP;
		else if (!isHorizontal && event.key === 'ArrowDown') deltaPercentage = RESIZE_KEYBOARD_STEP;
		else return;

		event.preventDefault();
		applyDelta(deltaPercentage);
	};

	return (
		<Container
			{...props}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerUp}
			onKeyDown={handleKeyDown}
			className={cn(
				'flex shrink-0 items-center justify-center bg-border outline-2 outline-offset-2 outline-transparent transition-colors hover:bg-primary/50 focus-visible:bg-primary/50 focus-visible:outline-primary',
				isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
				className,
			)}
			data-slot="resizable-handle"
			role="separator"
			aria-label={ariaLabel}
			aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
			aria-controls={`${previousPanelId} ${nextPanelId}`}
			aria-valuemin={valueMin}
			aria-valuemax={valueMax}
			aria-valuenow={Math.round(previousSize)}
			aria-valuetext={`${Math.round(previousSize)}%`}
			tabIndex={0}
		>
			<Container
				className={cn(
					'flex items-center justify-center rounded-xs bg-border',
					isHorizontal ? 'h-4 w-3' : 'h-3 w-4 rotate-90',
				)}
				aria-hidden="true"
			>
				<GripVerticalIcon className="size-3 text-muted-foreground" aria-hidden="true" />
			</Container>
		</Container>
	);
}
