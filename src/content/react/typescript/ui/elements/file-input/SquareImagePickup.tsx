import { JSX } from 'react';
import { ImagePlusIcon } from 'lucide-react';

import { SquareImagePickupPropsType } from './file-input.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container';
import { Text } from '../text';

/**
 * @description Square image pickup component.
 * @returns {JSX.Element} The SquareImagePickup component.
 */
export function SquareImagePickup({
	status,

	iconClassName,
	textContainerClassName,
	textClassName,
	containerClassName,

	containerProps,
	iconProps,
	textContainerProps,
	textProps,
}: SquareImagePickupPropsType): JSX.Element {
	return (
		<Container
			data-slot="square-image-pickup"
			className={cn(
				'flex h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all hover:border-primary',
				status === 'danger' ? 'border-danger' : 'border-muted',
				containerClassName,
			)}
			{...containerProps}
		>
			<ImagePlusIcon
				className={cn('text-muted-hover mx-auto size-8', iconClassName)}
				aria-hidden="true"
				{...iconProps}
			/>

			<Container
				className={cn('text-muted-light-foreground mt-4 flex flex-col items-center', textContainerClassName)}
				{...textContainerProps}
			>
				<Text className={cn('text-sm', textClassName)} {...textProps}>
					<Text as="span" className="text-sm font-medium text-secondary transition-all hover:text-primary">
						Upload a file
					</Text>{' '}
					or drag and drop
				</Text>
				<Text className={cn('text-sm', textClassName)} {...textProps}>
					To start Processing!
				</Text>
			</Container>
		</Container>
	);
}
