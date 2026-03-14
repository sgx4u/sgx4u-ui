'use client';

import {
	JSX,
	ChangeEvent as ReactChangeEvent,
	DragEvent as ReactDragEvent,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent as ReactMouseEvent,
	useEffect,
	useRef,
	useState,
} from 'react';

import { FileInputPropsType } from './file-input.type';
import { cn } from '../../utils/styles.util';
import { validateFiles } from './file-input.helper';

import { Container } from '../container';
import { Input } from '../input';
import { VisuallyHidden } from '../visually-hidden';

/**
 * @description File input that supports click-to-select and drag-and-drop, with validation and callbacks.
 * @param {FileInputPropsType} props - The properties object.
 * @returns {JSX.Element} The FileInput component.
 */
export function FileInput({
	accept,
	disabled,
	maxSize,
	minSize,
	multiple,
	maxFiles,
	disableClickAction,
	disableDragAndDropAction,

	onClick,
	onDragEnter,
	onDragLeave,
	onDragOver,
	onDrop,
	onChange,
	onDropAccepted,
	onDropRejected,
	onError,
	onFileDialogOpen,
	onFileDialogCancel,
	validator,

	preventClickEventPropagation,
	preventDragAndDropEventPropagation,
	preventKeyboardEventPropagation,

	className,
	children,

	inputProps,
	...props
}: FileInputPropsType): JSX.Element {
	const inputRef = useRef<HTMLInputElement>(null);
	const dialogOpenedRef = useRef(false);
	const dragOverCountRef = useRef(0);

	const [isDragOver, setIsDragOver] = useState(false);

	/** The accept attribute for the input element. */
	const acceptAttribute = accept && accept.length ? accept.join(',') : '*';

	const processFiles = (files: File[]): void => {
		/** Validate the files. */
		const { accepted, rejected } = validateFiles({
			files,
			options: {
				accept,
				maxSize,
				minSize,
				maxFiles: multiple ? maxFiles : 1,
				validator,
			},
		});

		/** Call onChange and onDropAccepted when there are accepted files. */
		if (accepted.length > 0) {
			onChange?.(accepted);
			onDropAccepted?.(accepted);
		}
		/** Call the onDropRejected callback if there are rejected files. */
		if (rejected.length > 0) onDropRejected?.(rejected);
	};

	useEffect(() => {
		/** If the onFileDialogCancel callback is not defined, return. */
		if (!onFileDialogCancel) return;

		const handleFocus = (): void => {
			/** If the dialog is opened, close it and call the onFileDialogCancel callback. */
			if (dialogOpenedRef.current) {
				dialogOpenedRef.current = false;
				onFileDialogCancel();
			}
		};

		window.addEventListener('focus', handleFocus);
		return (): void => window.removeEventListener('focus', handleFocus);
	}, [onFileDialogCancel]);

	const handleWrapperClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
		/** If the preventClickEventPropagation prop is true, stop the event propagation. */
		if (preventClickEventPropagation) event.stopPropagation();
		/** Call the onClick callback if it is defined. */
		onClick?.(event);

		/** If the disabled or disableClickAction prop is true, return. */
		if (disabled || disableClickAction) return;

		/** Set the dialog opened flag to true and call the onFileDialogOpen callback if it is defined. */
		dialogOpenedRef.current = true;
		onFileDialogOpen?.();
		/** Click the input element. */
		inputRef.current?.click();
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
		/** If the preventKeyboardEventPropagation prop is true, stop the event propagation. */
		if (preventKeyboardEventPropagation) event.stopPropagation();
		if (disabled || disableClickAction) return;

		/** If the key is Enter or Space, prevent the default behavior and click the input element. */
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			inputRef.current?.click();
		}
	};

	const handleDragEnter = (event: ReactDragEvent<HTMLDivElement>): void => {
		/** If the preventDragAndDropEventPropagation prop is true, stop the event propagation. */
		if (preventDragAndDropEventPropagation) event.stopPropagation();
		event.preventDefault();

		/** Increment the drag over count and set the drag over state to true. */
		dragOverCountRef.current += 1;
		setIsDragOver(true);
		onDragEnter?.(event);
	};

	const handleDragLeave = (event: ReactDragEvent<HTMLDivElement>): void => {
		/** If the preventDragAndDropEventPropagation prop is true, stop the event propagation. */
		if (preventDragAndDropEventPropagation) event.stopPropagation();

		/** Decrement the drag over count and set the drag over state to true if the drag over count is greater than 0. */
		dragOverCountRef.current = Math.max(0, dragOverCountRef.current - 1);
		setIsDragOver(dragOverCountRef.current > 0);
		onDragLeave?.(event);
	};

	const handleDragOver = (event: ReactDragEvent<HTMLDivElement>): void => {
		/** If the preventDragAndDropEventPropagation prop is true, stop the event propagation. */
		if (preventDragAndDropEventPropagation) event.stopPropagation();
		event.preventDefault();

		/** Set the drop effect to copy. */
		event.dataTransfer.dropEffect = 'copy';
		onDragOver?.(event);
	};

	const handleDrop = (event: ReactDragEvent<HTMLDivElement>): void => {
		/** If the preventDragAndDropEventPropagation prop is true, stop the event propagation. */
		if (preventDragAndDropEventPropagation) event.stopPropagation();
		event.preventDefault();

		dragOverCountRef.current = 0;
		setIsDragOver(false);
		onDrop?.(event);

		/** If the disabled or disableDragAndDropAction prop is true, return. */
		if (disabled || disableDragAndDropAction) return;
		const items = event.dataTransfer?.files;
		if (!items?.length) return;

		try {
			const files = Array.from(items);
			/** Validate and notify; processFiles calls onChange(accepted) and onDropAccepted(accepted). */
			processFiles(files);
		} catch (error) {
			onError?.(error instanceof Error ? error : new Error(String(error)));
		}
	};

	const handleInputChange = (event: ReactChangeEvent<HTMLInputElement>): void => {
		/** If the preventDragAndDropEventPropagation prop is true, stop the event propagation. */
		dialogOpenedRef.current = false;
		const files = event.target.files;
		if (!files?.length) return;

		/** Try to process the files. */
		try {
			processFiles(Array.from(files));
		} catch (error) {
			onError?.(error instanceof Error ? error : new Error(String(error)));
		}
		event.target.value = '';
	};

	return (
		<Container
			as="div"
			className={cn('relative', isDragOver && 'animate-pulse rounded-xl bg-muted-light', className)}
			onClick={handleWrapperClick}
			onKeyDown={handleKeyDown}
			onDragEnter={disableDragAndDropAction ? undefined : handleDragEnter}
			onDragLeave={disableDragAndDropAction ? undefined : handleDragLeave}
			onDragOver={disableDragAndDropAction ? undefined : handleDragOver}
			onDrop={disableDragAndDropAction ? undefined : handleDrop}
			data-slot="file-input"
			data-drag-over={isDragOver}
			role="button"
			aria-label="File input"
			aria-disabled={disabled}
			tabIndex={disabled ? undefined : 0}
			{...props}
		>
			<VisuallyHidden>
				<Input
					ref={inputRef}
					type="file"
					accept={acceptAttribute}
					multiple={multiple}
					disabled={disabled}
					onChange={handleInputChange}
					tabIndex={-1}
					aria-hidden
					{...inputProps}
				/>
			</VisuallyHidden>
			{children}
		</Container>
	);
}
