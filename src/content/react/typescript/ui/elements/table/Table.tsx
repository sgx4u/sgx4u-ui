import { JSX } from 'react';

import {
	TableCellPropsType,
	TableHeadCellPropsType,
	TablePropsType,
	TableRowPropsType,
	TableSectionPropsType,
} from './table.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

/** Variants for the Table component. */
export const { variants: tableVariants, types: TableVariantTypes } = makeVariants({
	base: 'w-full border-separate border-spacing-0 overflow-hidden rounded-lg border border-background-light bg-background',
	variants: {
		density: {
			compact: 'text-sm [&_td,&_th]:px-2 [&_td,&_th]:py-0.5',
			comfortable: 'text-sm [&_td,&_th]:px-3 [&_td,&_th]:py-1',
			spacious: 'text-base [&_td,&_th]:px-4 [&_td,&_th]:py-1.5',
		},
	},
	default: {
		density: 'comfortable',
	},
});

/**
 * @description A tabular data structure that organizes information into rows and columns.
 * @returns {JSX.Element} The Table component.
 */
export function Table({
	density = 'comfortable',
	className,

	...props
}: TablePropsType): JSX.Element {
	return (
		<table className={cn(tableVariants({ density }), className)} data-slot="table" aria-label="table" {...props} />
	);
}

/**
 * @description Semantic table header wrapper that keeps sticky state support.
 * @returns {JSX.Element} The TableHeader component.
 */
export function TableHeader({ className, ...props }: TableSectionPropsType): JSX.Element {
	return <thead className={cn('bg-background', className)} data-slot="table-header" {...props} />;
}

/**
 * @description Semantic table body wrapper.
 * @returns {JSX.Element} The TableBody component.
 */
export function TableBody({ ...props }: TableSectionPropsType): JSX.Element {
	return <tbody data-slot="table-body" {...props} />;
}

/**
 * @description Semantic table footer wrapper.
 * @returns {JSX.Element} The TableFooter component.
 */
export function TableFooter({ className, ...props }: TableSectionPropsType): JSX.Element {
	return <tfoot className={cn('bg-background-light font-semibold', className)} data-slot="table-footer" {...props} />;
}

/**
 * @description Table row that supports hover, selection, and pinned styling.
 * @returns {JSX.Element} The TableRow component.
 */
export function TableRow({ className, ...props }: TableRowPropsType): JSX.Element {
	return (
		<tr
			className={cn(
				'transition-all focus-within:bg-background-light hover:bg-background-light last:[&_td]:border-b-0',
				className,
			)}
			data-slot="table-row"
			aria-selected={props['aria-selected']}
			{...props}
		/>
	);
}

/** Variants for the Table cell component. */
export const { variants: tableCellVariants, types: TableCellVariantTypes } = makeVariants({
	base: 'border-b border-background-light text-start first:ps-4 last:pe-4',
	variants: {
		align: {
			left: 'text-start',
			center: 'text-center',
			right: 'text-end',
			justify: 'text-justify',
			char: 'text-char',
		},
	},
	default: {
		align: 'left',
	},
});

/**
 * @description Table header cell that wires alignment, sort affordances, and column-resize anchors.
 * @returns {JSX.Element} The TableHead component.
 */
export function TableHead({ className, ...props }: TableHeadCellPropsType): JSX.Element {
	return (
		<th
			className={cn('font-semibold', tableCellVariants({ align: props.align }), className)}
			data-slot="table-head"
			aria-sort={props['aria-sort'] ?? 'none'}
			{...props}
		/>
	);
}

/**
 * @description Table cell capable of hosting arbitrary components, including form controls.
 * @returns {JSX.Element} The TableCell component.
 */
export function TableCell({ className, ...props }: TableCellPropsType): JSX.Element {
	return (
		<td
			className={cn(tableCellVariants({ align: props.align }), className)}
			data-slot="table-cell"
			data-align={props.align}
			{...props}
		/>
	);
}
