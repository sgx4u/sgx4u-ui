import { JSX } from 'react';
import { XIcon } from 'lucide-react';

import { CircleImageViewPropsType } from './file-input.type';
import { cn } from '../../utils/styles.util';

import { Button } from '../button';
import { Container } from '../container';
import { Image } from '../image';

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
			className={cn(
				'absolute inset-0 size-20',
				status === 'danger' && 'border border-danger',
				containerClassName,
			)}
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
