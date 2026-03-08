import { JSX } from 'react';
import { Loader2Icon } from 'lucide-react';

import { LoaderPropsType } from './loader.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container';

/**
 * @description Visual indicator that communicates to users that content or actions are in progress.
 * @returns {JSX.Element} The SpinLoader component.
 */
export function SpinLoader({ className, containerProps, ...props }: LoaderPropsType): JSX.Element {
	const { className: containerClassName, ...containerRestProps } = containerProps ?? {};

	return (
		<Container
			as="span"
			data-slot="spin-loader"
			role="status"
			aria-live="polite"
			aria-busy="true"
			className={cn('inline-flex items-center justify-center', containerClassName, className)}
			{...containerRestProps}
		>
			{/* Spinner Icon. */}
			<Loader2Icon
				focusable="false"
				className={cn('size-6 animate-spin text-current', className)}
				aria-hidden="true"
				{...props}
			/>

			{/* Hidden text for screen readers. */}
			<Container as="span" className="sr-only">
				Loading.
			</Container>
		</Container>
	);
}
