import { JSX } from 'react';

import { ButtonGroupPropsType } from './button-group.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';

/** Button group variants. */
export const { variants: buttonGroupVariants, types: ButtonGroupVariantTypes } = makeVariants({
	base: 'inline-flex w-max overflow-hidden',
	variants: {
		orientation: {
			horizontal: 'flex-row',
			vertical: 'flex-col',
		},
	},
	default: {
		orientation: 'horizontal',
	},
});

/**
 * @description Layout helper that visually groups adjacent `Button` instances, merging borders and radii for horizontal or vertical toolbars while keeping each button focusable.
 * @returns {JSX.Element} The ButtonGroup component.
 */
export function ButtonGroup({
	orientation = 'horizontal',

	className,

	...props
}: ButtonGroupPropsType): JSX.Element {
	return (
		<Container
			as="div"
			className={cn(
				buttonGroupVariants({ orientation }),

				/** Middle buttons: remove all radius. */
				"[&>[data-slot='button']:not(:first-child):not(:last-child)]:rounded-none",

				/** Horizontal: left button loses right radius, right button loses left radius. */
				orientation === 'horizontal' &&
					"[&>[data-slot='button']:first-child]:rounded-r-none [&>[data-slot='button']:last-child]:rounded-l-none",

				/** Vertical: top button loses bottom radius, bottom button loses top radius. */
				orientation === 'vertical' &&
					"[&>[data-slot='button']:first-child]:rounded-b-none [&>[data-slot='button']:last-child]:rounded-t-none",

				/** Remove ONLY the side borders (not top/bottom). */
				/** Horizontal: remove right border from all but last (so only left separator remains). */
				orientation === 'horizontal' && "[&>[data-slot='button']:not(:last-child)]:border-r-0",

				/** Vertical: remove bottom border from all but last (so only top separator remains). */
				orientation === 'vertical' && "[&>[data-slot='button']:not(:last-child)]:border-b-0",

				/** Add separators between items (left or top borders only). */
				/** Horizontal */
				orientation === 'horizontal' && "[&>[data-slot='button']:not(:first-child)]:border-l-2",
				/** Vertical */
				orientation === 'vertical' && "[&>[data-slot='button']:not(:first-child)]:border-t-2",

				/** Ensure children never shrink unexpectedly. */
				"*:data-[slot='button']:shrink-0",

				className,
			)}
			data-slot="button-group"
			data-orientation={orientation}
			role="group"
			{...props}
		/>
	);
}
