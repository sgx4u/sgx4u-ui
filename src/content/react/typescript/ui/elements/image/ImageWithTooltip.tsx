import { JSX } from 'react';

import { ImageWithTooltipPropsType } from './image.type';
import { cn } from '../../utils/styles.util';

import { Tooltip } from '../tooltip';
import { Image } from './Image';

/**
 * @description Image that shows a fully styled, custom tooltip on hover instead of the browser's native title overlay.
 * @returns {JSX.Element} The ImageWithTooltip component.
 */
export function ImageWithTooltip({
	tooltipContent,
	tooltipProps,
	alt,
	className,

	...props
}: ImageWithTooltipPropsType): JSX.Element {
	const { containerProps, ...restTooltipProps } = tooltipProps ?? {};

	return (
		<Tooltip
			content={tooltipContent}
			containerProps={{ ...containerProps, className: cn(className, containerProps?.className) }}
			{...restTooltipProps}
		>
			<Image alt={alt} className={className} {...props} title="" />
		</Tooltip>
	);
}
