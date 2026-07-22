import { JSX } from 'react';

import { ButtonGroupPropsType } from './button-group.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';

/** Button group variants. */
export const { variants: buttonGroupVariants, types: ButtonGroupVariantTypes } = makeVariants({
	/** Shared layout, middle buttons lose their radius, buttons never shrink, and the focused button lifts above its neighbours so its focus ring is never clipped. */
	base: "inline-flex w-max *:data-[slot='button']:relative *:data-[slot='button']:shrink-0 [&>[data-slot='button']:focus-visible]:z-10 [&>[data-slot='button']:not(:first-child):not(:last-child)]:rounded-none",
	variants: {
		orientation: {
			/** Merge edges horizontally: flatten inner corners, drop inner right borders, and add a left separator between buttons. */
			horizontal:
				"flex-row [&>[data-slot='button']:first-child]:rounded-r-none [&>[data-slot='button']:last-child]:rounded-l-none [&>[data-slot='button']:not(:first-child)]:border-l-2 [&>[data-slot='button']:not(:last-child)]:border-r-0",

			/** Merge edges vertically: flatten inner corners, drop inner bottom borders, and add a top separator between buttons. */
			vertical:
				"flex-col [&>[data-slot='button']:first-child]:rounded-b-none [&>[data-slot='button']:last-child]:rounded-t-none [&>[data-slot='button']:not(:first-child)]:border-t-2 [&>[data-slot='button']:not(:last-child)]:border-b-0",
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
			className={cn(buttonGroupVariants({ orientation }), className)}
			data-slot="button-group"
			data-orientation={orientation}
			role="group"
			{...props}
		/>
	);
}
