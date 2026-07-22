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
	/** Keep the ratio stable even when invalid values are passed, and skip the style entirely when it is not positive. */
	const normalizedRatio = absoluteNumber(ratio) || undefined;

	return (
		<Container
			style={{ aspectRatio: normalizedRatio, ...style }}
			className={cn('overflow-hidden', className)}
			data-slot="aspect-ratio"
			{...props}
		/>
	);
}
