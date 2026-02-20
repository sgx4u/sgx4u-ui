import { JSX } from 'react';

import { StarIndicatorPropsType } from './indicators.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container/Container';

/**
 * @name Star Indicator
 * @description Small visual markers, such as asterisks, used to call out required or special fields in forms.
 * @returns {JSX.Element} The StarIndicator component.
 */
export function StarIndicator({
	className,

	...props
}: StarIndicatorPropsType): JSX.Element {
	const isHidden = props['aria-hidden'] ?? true;

	return (
		<Container
			as="span"
			className={cn('text-danger', className)}
			data-slot="star-indicator"
			aria-hidden={isHidden}
			{...props}
		>
			<>*</>

			{/* Hidden text for screen readers if not aria-hidden. */}
			{!isHidden && (
				<Container as="span" className="sr-only" aria-label="required">
					Required.
				</Container>
			)}
		</Container>
	);
}
