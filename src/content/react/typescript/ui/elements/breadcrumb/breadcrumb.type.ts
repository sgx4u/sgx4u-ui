import { ReactNode } from 'react';

import { ContainerPropsType } from '../container';
import { LinkPropsType } from '../link';
import { ListPropsType } from '../list';
import { ListItemPropsType } from '../list-item';
import { PopoverContentPropsType, PopoverPropsType, PopoverTriggerPropsType } from '../popover';

/** Props type for the RegisterItem component. */
export type RegisterItemPropsType = {
	index: number;
	type: 'item' | 'separator';
	width: number;
	isVisible: boolean;
	link: string;
	label: ReactNode;
};

/** Context type for the Breadcrumb component. */
export type BreadcrumbContextType = {
	/** Unique identifier to identify the breadcrumb element. */
	breadcrumbUid: string;

	/** Child elements indexed by their unique identifier. */
	childElements: Record<string, RegisterItemPropsType>;

	/** Register a breadcrumb item or separator. */
	registerItem: (element: HTMLElement) => RegisterItemPropsType | null;

	/** Set the width of the ellipsis. */
	setEllipsisWidth: (width: number) => void;

	/** Popover props. */
	popoverProps: BreadcrumbPropsType['popoverProps'];

	/** Popover trigger props. */
	popoverTriggerProps: BreadcrumbPropsType['popoverTriggerProps'];

	/** Popover content props. */
	popoverContentProps: BreadcrumbPropsType['popoverContentProps'];
};

/** Props type for the Breadcrumb component. */
export type BreadcrumbPropsType = Omit<ContainerPropsType, 'as'> & {
	/** List props (list component props). */
	listProps?: ListPropsType;

	/** Popover props (popover component props). */
	popoverProps?: PopoverPropsType;

	/** Popover trigger props (popover trigger component props). */
	popoverTriggerProps?: PopoverTriggerPropsType;

	/** Popover content props (popover content component props). */
	popoverContentProps?: PopoverContentPropsType;

	/** HTML element to render as. Default - nav. */
	as?: ContainerPropsType['as'];
};

/** Props type for the BreadcrumbItem component. */
export type BreadcrumbItemPropsType = ListItemPropsType & {
	/** Whether item is current page. */
	current?: boolean;

	/** Link destination for the item. */
	href?: string;

	/** Link component props. */
	linkProps?: LinkPropsType;
};

/** Props type for the BreadcrumbSeparator component. */
export type BreadcrumbSeparatorPropsType = Omit<ListItemPropsType, 'children'> & {
	/** Children. Default - /. */
	children?: string;
};

/** Props type for the BreadcrumbEllipsis component. */
export type BreadcrumbEllipsisPropsType = {
	/** Height of the ellipsis. */
	itemHeight: number;

	/** Popover component props. */
	popoverProps: BreadcrumbPropsType['popoverProps'];

	/** Popover trigger component props. */
	popoverTriggerProps: BreadcrumbPropsType['popoverTriggerProps'];

	/** Popover content component props. */
	popoverContentProps: BreadcrumbPropsType['popoverContentProps'];
};
