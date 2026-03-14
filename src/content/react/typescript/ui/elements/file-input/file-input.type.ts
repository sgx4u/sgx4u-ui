import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from 'react';

import { ContainerPropsType } from '../container';
import { InputPropsType } from '../input';

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
	accept?: string[];

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

	/** Callback when a file is dropped on the file input. */
	onDrop?: (event: ReactDragEvent<HTMLDivElement>) => void;

	/** Callback when the selected files change (called with accepted files after selection or drop). */
	onChange?: (files: File[]) => void;

	/** Callback when files are dropped and accepted. */
	onDropAccepted?: (files: File[]) => void;

	/** Callback when files are dropped and rejected. */
	onDropRejected?: (files: File[]) => void;

	/** Callback when an error occurs. */
	onError?: (error: Error) => void;

	/** Callback when the file dialog is opened. */
	onFileDialogOpen?: () => void;

	/** Callback when the file dialog is canceled. */
	onFileDialogCancel?: () => void;

	/** Validator function; return false to reject files. */
	validator?: (files: File[]) => boolean;

	/** Prevent click event propagation. */
	preventClickEventPropagation?: boolean;

	/** Prevent drag and drop event propagation. */
	preventDragAndDropEventPropagation?: boolean;

	/** Prevent key down event propagation. */
	preventKeyboardEventPropagation?: boolean;

	/** Props for the input element. */
	inputProps?: Omit<
		InputPropsType,
		'ref' | 'type' | 'accept' | 'multiple' | 'disabled' | 'onChange' | 'tabIndex' | 'className'
	>;
};
