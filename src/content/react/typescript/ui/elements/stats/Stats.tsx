import { JSX } from 'react';
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';

import { StatsPropsType, StatsTrendType } from './stats.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container';
import { Label } from '../label';
import { Text } from '../text';

/** Icon rendered per trend direction. */
const trendIcon: Record<StatsTrendType, typeof TrendingUpIcon> = {
	up: TrendingUpIcon,
	down: TrendingDownIcon,
	neutral: MinusIcon,
};

/** Text color classes applied per trend direction. */
const trendClassName: Record<StatsTrendType, string> = {
	up: 'text-success',
	down: 'text-danger',
	neutral: 'text-muted-foreground',
};

/**
 * @description Compact metric display for dashboards, showing a label, value, and optional trend indicator.
 * @returns {JSX.Element} The Stats component.
 */
export function Stats({
	label,
	value,
	helperText,
	trend,
	trendValue,
	className,
	...props
}: StatsPropsType): JSX.Element {
	const TrendIcon = trend ? trendIcon[trend] : null;

	return (
		<Container className={cn('flex flex-col gap-1', className)} data-slot="stats" {...props}>
			<Label variant="muted" data-slot="stats-label">
				{label}
			</Label>

			<Container className="flex items-baseline gap-2">
				<Text as="subheading" data-slot="stats-value" className="font-bold">
					{value}
				</Text>
				{trend && TrendIcon && (
					<Container
						className={cn('flex items-center gap-0.5 text-sm font-medium', trendClassName[trend])}
						data-slot="stats-trend"
					>
						<TrendIcon className="size-3.5" aria-hidden="true" />
						{trendValue}
					</Container>
				)}
			</Container>

			{helperText && (
				<Text as="body-small" variant="muted" data-slot="stats-helper-text">
					{helperText}
				</Text>
			)}
		</Container>
	);
}
