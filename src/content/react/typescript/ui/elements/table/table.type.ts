import { ComponentPropsWithRef } from 'react';

/** Props type for the Table component. */
export type TablePropsType = ComponentPropsWithRef<'table'> & {
	/** Visual density preset that controls cell padding. Default - comfortable. */
	density?: 'compact' | 'comfortable' | 'spacious';
};

/** Props type for the Table section component. */
export type TableSectionPropsType = ComponentPropsWithRef<'thead' | 'tbody' | 'tfoot'>;

/** Props type for the Table row component. */
export type TableRowPropsType = ComponentPropsWithRef<'tr'>;

/** Props type for the Table head cell component. */
export type TableHeadCellPropsType = ComponentPropsWithRef<'th'>;

/** Props type for the Table cell component. */
export type TableCellPropsType = ComponentPropsWithRef<'td'>;
