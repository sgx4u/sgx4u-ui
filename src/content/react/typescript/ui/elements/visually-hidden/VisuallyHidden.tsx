import { JSX } from 'react';

import { VisuallyHiddenPropsType } from './visually-hidden.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container/Container';

/**
 * @description Utility for content that should be available to screen readers but not visible on screen.
 * @returns {JSX.Element} The VisuallyHidden component.
 */
export function VisuallyHidden({ className, ...props }: VisuallyHiddenPropsType): JSX.Element {
	return <Container as="span" className={cn('sr-only', className)} data-slot="visually-hidden" {...props} />;
}
