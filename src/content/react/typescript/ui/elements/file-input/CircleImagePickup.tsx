import { JSX } from 'react';
import { PlusIcon } from 'lucide-react';

import { CircleImagePickupPropsType } from './file-input.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container';

/**
 * @description Circle image pickup component.
 * @returns {JSX.Element} The CircleImagePickup component.
 */
export function CircleImagePickup({
	status,

	iconClassName,
	containerClassName,

	containerProps,
	iconProps,
}: CircleImagePickupPropsType): JSX.Element {
	return (
		<Container
			data-slot="circle-image-pickup"
			className={cn(
				'flex size-20 cursor-pointer items-center justify-center rounded-full border-2 border-dotted border-muted transition-all hover:border-primary',
				status === 'danger' ? 'border-danger' : 'border-muted',
				containerClassName,
			)}
			{...containerProps}
		>
			<PlusIcon className={cn('size-7 text-muted-foreground', iconClassName)} {...iconProps} />
		</Container>
	);
}
