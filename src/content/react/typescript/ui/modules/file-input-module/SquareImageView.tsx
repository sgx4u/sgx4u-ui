import { JSX } from 'react';
import { LucideProps, XIcon } from 'lucide-react';

import { cn } from '../../utils/styles.util';

import { Button, ButtonPropsType } from '../../elements/button';
import { Container, ContainerPropsType } from '../../elements/container';
import { Image, ImagePropsType } from '../../elements/image';

/** Square image view props type. */
export type SquareImageViewPropsType = {
	src?: string;
	onChange?: (src: string | undefined) => void;
	status?: 'error' | 'success';

	imageClassName?: string;
	closeButtonClassName?: string;
	closeIconClassName?: string;
	containerClassName?: string;

	containerProps?: Omit<ContainerPropsType, 'className'>;
	imageProps?: Omit<ImagePropsType, 'src' | 'alt' | 'className'>;
	closeButtonProps?: Omit<ButtonPropsType, 'className'>;
	closeIconProps?: Omit<LucideProps, 'className'>;
};

/**
 * @description Square image view component.
 * @param {SquareImageViewPropsType} props - The properties object.
 * @returns {JSX.Element} The SquareImageView component.
 */
export function SquareImageView({
	src,
	onChange,
	status,

	imageClassName,
	closeButtonClassName,
	closeIconClassName,
	containerClassName,

	imageProps,
	closeButtonProps,
	closeIconProps,
	containerProps,
}: SquareImageViewPropsType): JSX.Element {
	return (
		<Container
			as="div"
			data-slot="square-image-view"
			className={cn(
				'relative h-52 w-full overflow-hidden rounded-xl',
				status === 'error' && 'border border-danger',
				containerClassName,
			)}
			{...containerProps}
		>
			<Image
				src={src}
				alt={`Uploaded`}
				className={cn('size-full object-cover', imageClassName)}
				{...imageProps}
			/>
			<Button
				onClick={(event) => {
					event.stopPropagation();
					if (onChange) onChange(undefined);
				}}
				title="Remove Image"
				variant="danger"
				className={cn('absolute top-2 right-2 h-max w-max rounded-full p-1', closeButtonClassName)}
				{...closeButtonProps}
			>
				<XIcon
					className={cn('size-5 stroke-[3px]', closeIconClassName)}
					aria-hidden="true"
					{...closeIconProps}
				/>
			</Button>
		</Container>
	);
}
