import { JSX } from 'react';

import { FloatingActionButtonPositionType, FloatingActionButtonPropsType } from './floating-action-button.type';
import { cn } from '../../utils/styles.util';

import { Button } from '../button';

/** Tailwind classes anchoring the button to each supported position. */
const positionClassName: Record<FloatingActionButtonPositionType, string> = {
	'bottom-right': 'bottom-(--fab-offset) right-(--fab-offset)',
	'bottom-left': 'bottom-(--fab-offset) left-(--fab-offset)',
	'bottom-center': 'bottom-(--fab-offset) left-1/2 -translate-x-1/2',
	'top-right': 'top-(--fab-offset) right-(--fab-offset)',
	'top-left': 'top-(--fab-offset) left-(--fab-offset)',
};

/**
 * @description Fixed-position circular button used to surface a page's primary action.
 * @returns {JSX.Element} The FloatingActionButton component.
 */
export function FloatingActionButton({
	position = 'bottom-right',
	offset = 24,

	variant = 'primary',
	size = 'icon-lg',
	className,

	style,
	...props
}: FloatingActionButtonPropsType): JSX.Element {
	return (
		<Button
			variant={variant}
			size={size}
			style={{ ['--fab-offset' as string]: `${offset}px`, ...style }}
			className={cn('fixed z-top rounded-full shadow-lg', positionClassName[position], className)}
			data-slot="floating-action-button"
			{...props}
		/>
	);
}
