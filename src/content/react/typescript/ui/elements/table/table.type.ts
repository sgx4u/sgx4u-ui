import { ComponentPropsWithRef } from 'react';

import { TableCellVariantTypes, TableVariantTypes } from './Table';

/** Props type for the Table component. */
export type TablePropsType = ComponentPropsWithRef<'table'> & {
	/** Visual density preset that controls cell padding. Default - comfortable. */
	density?: typeof TableVariantTypes.density;
};

/** Props type for the Table section component. */
export type TableSectionPropsType = ComponentPropsWithRef<'thead' | 'tbody' | 'tfoot'>;

/** Props type for the Table row component. */
export type TableRowPropsType = ComponentPropsWithRef<'tr'>;

/** Props type for the Table head cell component. */
export type TableHeadCellPropsType = Omit<ComponentPropsWithRef<'th'>, 'align'> & {
	/** Cell text alignment. Default - left. */
	align?: typeof TableCellVariantTypes.align;
};

/** Props type for the Table cell component. */
export type TableCellPropsType = Omit<ComponentPropsWithRef<'td'>, 'align'> & {
	/** Cell text alignment. Default - left. */
	align?: typeof TableCellVariantTypes.align;
};
