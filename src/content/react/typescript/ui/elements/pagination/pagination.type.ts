import { ButtonPropsType } from '../button';
import { ContainerPropsType } from '../container';
import { InputPropsType } from '../input';

/** Pagination props type. */
export type PaginationPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Current active page (1-indexed). When provided together with totalPages, renders a full page window automatically. */
	page?: number;

	/** Total number of pages. */
	totalPages?: number;

	/** Callback invoked when the active page changes. */
	onPageChange?: (page: number) => void;

	/** Number of pages to show on each side of the current page. Default - 1. */
	siblingCount?: number;
};

/** Pagination content props type. */
export type PaginationContentPropsType = ContainerPropsType;

/** Pagination item props type. */
export type PaginationItemPropsType = ContainerPropsType;

/** Pagination link props type. */
export type PaginationLinkPropsType = ButtonPropsType & {
	/** Whether this page link represents the current page. */
	isActive?: boolean;
};

/** Pagination previous/next props type. */
export type PaginationPreviousNextPropsType = ButtonPropsType;

/** Pagination input props type. */
export type PaginationInputPropsType = Omit<
	InputPropsType,
	'name' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'onKeyDown' | 'min' | 'max'
> & {
	/** Current active page (1-indexed). Keeps the input in sync when the page changes externally. */
	page?: number;

	/** Total number of pages. Entered values are clamped into 1..totalPages. */
	totalPages: number;

	/** Callback invoked when the user submits a valid page number with Enter. */
	onPageChange: (page: number) => void;

	/** Form field name. Default - pagination-page. */
	name?: string;
};
