import { JSX } from 'react';

import { IndicatorsPropsType } from './indicators.type';

import { StarIndicator } from './StarIndicator';

/**
 * @name Indicators
 * @description Small visual markers, such as asterisks, used to call out required or special fields in forms.
 * @returns {JSX.Element} The Indicators component.
 */
export function Indicators({ variant, ...props }: IndicatorsPropsType): JSX.Element {
	if (variant === 'star') return <StarIndicator {...props} />;
	return <></>;
}
