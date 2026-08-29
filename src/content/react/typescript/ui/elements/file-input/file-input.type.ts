import { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from 'react';
import { LucideProps } from 'lucide-react';

import { ButtonPropsType } from '../button';
import { ContainerPropsType } from '../container';
import { ImagePropsType } from '../image';
import { InputPropsType } from '../input';
import { TextPropsType } from '../text';

type ContainerOmittedProps =
	| 'accept'
	| 'disabled'
	| 'maxSize'
	| 'minSize'
	| 'multiple'
	| 'maxFiles'
	| 'disableClickAction'
	| 'disableDragAndDropAction'
	| 'onClick'
	| 'onDragEnter'
	| 'onDragLeave'
	| 'onDragOver'
	| 'onDrop'
	| 'onChange'
	| 'onDropAccepted'
	| 'onDropRejected'
	| 'onError'
	| 'onFileDialogOpen'
	| 'onFileDialogCancel'
	| 'validator'
	| 'preventClickEventPropagation'
	| 'preventDragAndDropEventPropagation'
	| 'preventKeyboardEventPropagation';

/** FileInput props type. */
export type FileInputPropsType = Omit<ContainerPropsType, ContainerOmittedProps> & {
	/** Accepted file types (e.g. ['.png', 'image/*']). */
	accept?: Array<string>;

	/** Whether the file input is disabled. */
	disabled?: boolean;

	/** Maximum file size (in bytes). */
	maxSize?: number;

	/** Minimum file size (in bytes). */
	minSize?: number;

	/** Whether the file input is multiple selectable. */
	multiple?: boolean;

	/** Maximum number of files that can be selected. */
	maxFiles?: number;

	/** Whether the file input disables the click action. */
	disableClickAction?: boolean;

	/** Whether the file input disables the drag and drop action. */
	disableDragAndDropAction?: boolean;

	/** Callback when the file input wrapper is clicked. */
	onClick?: (event: ReactMouseEvent<HTMLDivElement>) => void;

	/** Callback when a file is dragged over the file input. */
	onDragEnter?: (event: ReactDragEvent<HTMLDivElement>) => void;

	/** Callback when a file is dragged out of the file input. */
	onDragLeave?: (event: ReactDragEvent<HTMLDivElement>) => void;

	/** Callback when a file is dragged over the file input. */
	onDragOver?: (event: ReactDragEvent<HTMLDivElement>) => void;

	/** Callback when the selected files change (called with accepted files after selection or drop). */
	onChange?: (files: Array<File>) => void;

	/** Callback when a file is dropped on the file input. */
	onDrop?: (event: ReactDragEvent<HTMLDivElement>) => void;

	/** Callback when files are dropped and accepted. */
	onDropAccepted?: (files: Array<File>) => void;

	/** Callback when files are dropped and rejected. */
	onDropRejected?: (files: Array<File>) => void;

	/** Callback when an error occurs. */
	onError?: (error: Error) => void;

	/** Callback when the file dialog is opened. */
	onFileDialogOpen?: () => void;

	/** Callback when the file dialog is canceled. */
	onFileDialogCancel?: () => void;

	/** Validator function; return false to reject files. */
	validator?: (files: Array<File>) => boolean;

	/** Prevent click event propagation. */
	preventClickEventPropagation?: boolean;

	/** Prevent drag and drop event propagation. */
	preventDragAndDropEventPropagation?: boolean;

	/** Prevent key down event propagation. */
	preventKeyboardEventPropagation?: boolean;

	/** Additional props for the input element. */
	inputProps?: Omit<
		InputPropsType,
		'ref' | 'type' | 'accept' | 'multiple' | 'disabled' | 'onChange' | 'tabIndex' | 'className'
	>;
};

/** Square image pickup props type. */
export type SquareImagePickupPropsType = {
	/** Visual state used to tint the border. */
	status?: 'danger' | 'success';

	/** Class names for the icon. */
	iconClassName?: string;

	/** Class names for the text container. */
	textContainerClassName?: string;

	/** Class names for the text. */
	textClassName?: string;

	/** Class names for the container. */
	containerClassName?: string;

	/** Additional props for the container. */
	containerProps?: Omit<ContainerPropsType, 'className'>;

	/** Additional props for the icon. */
	iconProps?: Omit<LucideProps, 'className'>;

	/** Additional props for the text container. */
	textContainerProps?: Omit<ContainerPropsType, 'className'>;

	/** Additional props for the text. */
	textProps?: Omit<TextPropsType, 'className'>;
};

/** Square image view props type. */
export type SquareImageViewPropsType = {
	/** Source of the image. */
	src?: string;

	/** Callback when the image source changes. */
	onChange?: (src: string | undefined) => void;

	/** Visual state used to tint the border. */
	status?: 'danger' | 'success';

	/** Class names for the image. */
	imageClassName?: string;

	/** Class names for the close button. */
	closeButtonClassName?: string;

	/** Class names for the close icon. */
	closeIconClassName?: string;

	/** Class names for the container. */
	containerClassName?: string;

	/** Additional props for the container. */
	containerProps?: Omit<ContainerPropsType, 'className'>;

	/** Additional props for the image. */
	imageProps?: Omit<ImagePropsType, 'src' | 'alt' | 'className'>;

	/** Additional props for the close button. */
	closeButtonProps?: Omit<ButtonPropsType, 'className'>;

	/** Additional props for the close icon. */
	closeIconProps?: Omit<LucideProps, 'className'>;
};

/** Circle image pickup props type. */
export type CircleImagePickupPropsType = {
	/** Visual state used to tint the border. */
	status?: 'danger' | 'success';

	/** Class names for the icon. */
	iconClassName?: string;

	/** Class names for the container. */
	containerClassName?: string;

	/** Additional props for the container. */
	containerProps?: Omit<ContainerPropsType, 'className'>;

	/** Additional props for the icon. */
	iconProps?: Omit<LucideProps, 'className'>;
};

/** Circle image view props type. */
export type CircleImageViewPropsType = {
	/** Source of the image. */
	src?: string;

	/** Callback when the image source changes. */
	onChange?: (src: string | undefined) => void;

	/** Visual state used to tint the border. */
	status?: 'danger' | 'success';

	/** Class names for the image. */
	imageClassName?: string;

	/** Class names for the close button. */
	closeButtonClassName?: string;

	/** Class names for the close icon. */
	closeIconClassName?: string;

	/** Class names for the container. */
	containerClassName?: string;

	/** Additional props for the image. */
	imageProps?: Omit<ImagePropsType, 'src' | 'alt' | 'className'>;

	/** Additional props for the close button. */
	closeButtonProps?: Omit<ButtonPropsType, 'className'>;

	/** Additional props for the close icon. */
	closeIconProps?: Omit<LucideProps, 'className'>;

	/** Additional props for the container. */
	containerProps?: Omit<ContainerPropsType, 'className'>;
};
