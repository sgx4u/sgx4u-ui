import { ReactNode } from 'react';

import { ContainerPropsType } from '../container';

/** Resizable layout direction. */
export type ResizableDirectionType = 'horizontal' | 'vertical';

/** Panel size bookkeeping keyed by panel id. */
export type ResizablePanelSizeMapType = Record<string, number>;

/** Size constraints for a single panel. */
export type ResizablePanelConstraintsType = {
	/** Minimum size as a percentage of the group. */
	minSize: number;

	/** Maximum size as a percentage of the group. */
	maxSize: number;
};

/** Context value shared across ResizablePanelGroup, ResizablePanel, and ResizableHandle. */
export type ResizableContextType = {
	/** Layout direction of the group. */
	direction: ResizableDirectionType;

	/** Current size (percentage of the group) for each registered panel id. */
	sizes: ResizablePanelSizeMapType;

	/** Registers a panel's id and its size constraints, seeding its initial size. */
	registerPanel: (props: { id: string; defaultSize?: number; minSize: number; maxSize: number }) => void;

	/** Adjusts the sizes of two adjacent panels by a percentage delta, respecting their min/max constraints. */
	resizeAdjacentPanels: (props: { previousId: string; nextId: string; deltaPercentage: number }) => void;

	/** Returns the registered constraints for a panel id, when available. */
	getPanelConstraints: (id: string) => ResizablePanelConstraintsType | undefined;
};

/** Resizable Panel Group props type. */
export type ResizablePanelGroupPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Layout direction of the group. Default - horizontal. */
	direction?: ResizableDirectionType;

	/** Panels and handles, in order. */
	children: ReactNode;
};

/** Resizable Panel props type. */
export type ResizablePanelPropsType = Omit<ContainerPropsType, 'as' | 'id'> & {
	/** Unique id for this panel within its group. */
	id: string;

	/** Initial size as a percentage of the group. Default - evenly distributed. */
	defaultSize?: number;

	/** Minimum size as a percentage of the group. Default - 10. */
	minSize?: number;

	/** Maximum size as a percentage of the group. Default - 90. */
	maxSize?: number;
};

/** Resizable Handle props type. */
export type ResizableHandlePropsType = Omit<ContainerPropsType, 'as'> & {
	/** Id of the panel before this handle. */
	previousPanelId: string;

	/** Id of the panel after this handle. */
	nextPanelId: string;

	/** Accessible label describing the resize control. */
	'aria-label'?: string;
};
