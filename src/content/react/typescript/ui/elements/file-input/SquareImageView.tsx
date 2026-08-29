import { JSX } from 'react';
import { XIcon } from 'lucide-react';

import { SquareImageViewPropsType } from './file-input.type';
import { cn } from '../../utils/styles.util';

import { Button } from '../button';
import { Container } from '../container';
import { Image } from '../image';

/**
 * @description Square image view component.
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
	if (!src) return <></>;

	return (
		<Container
			data-slot="square-image-view"
			className={cn(
				'relative h-52 w-full overflow-hidden rounded-xl',
				status === 'danger' && 'border border-danger',
				containerClassName,
			)}
			{...containerProps}
		>
			<Image src={src} alt="Uploaded" className={cn('size-full object-cover', imageClassName)} {...imageProps} />
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
