import { JSX } from 'react';
import { LucideProps, XIcon } from 'lucide-react';

import { cn } from '../../utils/styles.util';

import { Button, ButtonPropsType } from '../../elements/button';
import { Container, ContainerPropsType } from '../../elements/container';
import { Image, ImagePropsType } from '../../elements/image';

/** Circle image view props type. */
export type CircleImageViewPropsType = {
	src?: string;
	onChange?: (src: string | undefined) => void;
	status?: 'error' | 'success';

	imageClassName?: string;
	closeButtonClassName?: string;
	closeIconClassName?: string;
	containerClassName?: string;

	imageProps?: Omit<ImagePropsType, 'src' | 'alt' | 'className'>;
	closeButtonProps?: Omit<ButtonPropsType, 'className'>;
	closeIconProps?: Omit<LucideProps, 'className'>;
	containerProps?: Omit<ContainerPropsType, 'className'>;
};

/**
 * @description Circle image view component.
 * @param {CircleImageViewPropsType} props - The properties object.
 * @returns {JSX.Element} The CircleImageView component.
 */
export function CircleImageView({
	src,
	onChange,
	status,
	imageClassName,
	closeButtonClassName,
	closeIconClassName,
	containerClassName,

	containerProps,
	imageProps,
	closeButtonProps,
	closeIconProps,
}: CircleImageViewPropsType): JSX.Element {
	return (
		<Container
			as="div"
			data-slot="circle-image-view"
			className={cn('relative size-20', status === 'error' && 'border border-danger', containerClassName)}
			{...containerProps}
		>
			<Image
				src={src}
				alt="Profile Image"
				className={cn('size-full rounded-full object-cover', imageClassName)}
				{...imageProps}
			/>
			<Button
				onClick={(event) => {
					event.stopPropagation();
					if (onChange) onChange(undefined);
				}}
				title="Remove Image"
				variant="danger"
				size="icon"
				className={cn(
					'absolute inset-[5px_-5px_auto_auto] size-5 rounded-full stroke-[3px] p-0.5',
					closeButtonClassName,
				)}
				{...closeButtonProps}
			>
				<XIcon
					className={cn('size-full stroke-[3px]', closeIconClassName)}
					aria-hidden="true"
					{...closeIconProps}
				/>
			</Button>
		</Container>
	);
}
