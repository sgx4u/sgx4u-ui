import { JSX } from 'react';
import { LucideProps, PlusIcon } from 'lucide-react';

import { cn } from '../../utils/styles.util';

import { Container, ContainerPropsType } from '../container';

/** Circle image pickup props type. */
export type CircleImagePickupPropsType = {
	status?: 'error' | 'success';

	iconClassName?: string;
	containerClassName?: string;

	containerProps?: Omit<ContainerPropsType, 'className'>;
	iconProps?: Omit<LucideProps, 'className'>;
};

/**
 * @description Circle image pickup component.
 * @param {CircleImagePickupPropsType} props - The properties object.
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
			as="div"
			data-slot="circle-image-pickup"
			className={cn(
				'flex size-20 cursor-pointer items-center justify-center rounded-full border-2 border-dotted border-muted transition-all hover:border-primary',
				status === 'error' ? 'border-danger' : 'border-muted',
				containerClassName,
			)}
			{...containerProps}
		>
			<PlusIcon className={cn('size-7 text-muted-foreground', iconClassName)} {...iconProps} />
		</Container>
	);
}
