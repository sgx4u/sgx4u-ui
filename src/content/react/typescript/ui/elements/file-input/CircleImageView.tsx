import { JSX } from 'react';
import { LucideProps, XIcon } from 'lucide-react';

import { cn } from '../../utils/styles.util';

import { Button, ButtonPropsType } from '../button';
import { Container, ContainerPropsType } from '../container';
import { Image, ImagePropsType } from '../image';

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
	if (!src) return <></>;
	return (
		<Container
			data-slot="circle-image-view"
			className={cn('absolute inset-0 size-20', status === 'error' && 'border border-danger', containerClassName)}
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
