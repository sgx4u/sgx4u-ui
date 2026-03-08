import { JSX } from 'react';
import { ImagePlusIcon, LucideProps } from 'lucide-react';

import { cn } from '../../utils/styles.util';

import { Container, ContainerPropsType } from '../../elements/container';
import { Text, TextPropsType } from '../../elements/text';

/** Square image pickup props type. */
export type SquareImagePickupPropsType = {
	status?: 'error' | 'success';

	iconClassName?: string;
	textContainerClassName?: string;
	textClassName?: string;
	containerClassName?: string;

	containerProps?: Omit<ContainerPropsType, 'className'>;
	iconProps?: Omit<LucideProps, 'className'>;
	textContainerProps?: Omit<ContainerPropsType, 'className'>;
	textProps?: Omit<TextPropsType, 'className'>;
};

/**
 * @description Square image pickup component.
 * @param {SquareImagePickupPropsType} props - The properties object.
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
			as="div"
			data-slot="square-image-pickup"
			className={cn(
				'flex h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed',
				status === 'error' ? 'border-danger' : 'border-muted',
				containerClassName,
			)}
			{...containerProps}
		>
			<ImagePlusIcon
				className={cn('text-muted-hover mx-auto size-12', iconClassName)}
				aria-hidden="true"
				{...iconProps}
			/>

			<Container
				as="div"
				className={cn(
					'text-muted-light-foreground mt-4 flex flex-col items-center text-sm',
					textContainerClassName,
				)}
				{...textContainerProps}
			>
				<Text className={textClassName} {...textProps}>
					<Text as="span" className="font-medium text-secondary transition-all hover:text-primary/75">
						Upload a file
					</Text>{' '}
					or drag and drop
				</Text>
				<Text {...textProps}>To start Processing!</Text>
			</Container>
		</Container>
	);
}
