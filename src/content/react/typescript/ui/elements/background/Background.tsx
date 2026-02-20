import { JSX } from 'react';

import { BackgroundPropsType } from './background.type';

import { BackgroundGradient } from './BackgroundGradient';
import { GradientPulse } from './GradientPulse';

/**
 * @name Background
 * @description Decorative background components for applying animated gradients and ambient color effects behind your UI.
 * @returns {JSX.Element} The Background component.
 */
export function Background({ variant = 'bg-gradient', ...props }: BackgroundPropsType): JSX.Element {
	if (variant === 'bg-gradient') return <BackgroundGradient {...props} />;
	if (variant === 'pulse') return <GradientPulse {...props} />;
	return <></>;
}
