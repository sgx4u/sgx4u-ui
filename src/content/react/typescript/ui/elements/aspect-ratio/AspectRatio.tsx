import { JSX } from 'react';

import { AspectRatioPropsType } from './aspect-ratio.type';
import { absoluteNumber } from '../../utils/number.util';
import { cn } from '../../utils/styles.util';

import { Container } from '../container';

/**
 * @description Responsive aspect-ratio wrapper that locks its children to a given proportion.
 * @returns {JSX.Element} The AspectRatio component.
 */
export function AspectRatio({
	ratio,
	style,
	className,

	...props
}: AspectRatioPropsType): JSX.Element {
	/** Aspect-ratio containers are layout-only; they should not be focusable or announced by screen readers. */
	const isPurelyDecorative = props['aria-hidden'] !== false;

	/** Keep the ratio stable even when invalid values are passed. */
	const normalizedRatio = absoluteNumber(ratio);

	return (
		<Container
			as="div"
			style={{ aspectRatio: normalizedRatio, ...style }}
			className={cn('overflow-hidden', className)}
			data-slot="aspect-ratio"
			role="presentation"
			aria-hidden={isPurelyDecorative}
			{...props}
		/>
	);
}
