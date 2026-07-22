import { JSX } from 'react';

import { StarIndicatorPropsType } from './indicators.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container/Container';

/**
 * @description Small visual markers, such as asterisks, used to call out required or special fields in forms.
 * @returns {JSX.Element} The StarIndicator component.
 */
export function StarIndicator({
	as = 'span',
	className,

	...props
}: StarIndicatorPropsType): JSX.Element {
	const isHidden = props['aria-hidden'] ?? true;

	return (
		<Container
			{...props}
			as={as}
			className={cn('text-danger', className)}
			data-slot="star-indicator"
			aria-hidden={isHidden}
		>
			*{/* Hidden text for screen readers when the indicator is exposed. */}
			{!isHidden && (
				<Container as="span" className="sr-only">
					Required.
				</Container>
			)}
		</Container>
	);
}
