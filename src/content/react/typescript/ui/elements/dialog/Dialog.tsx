'use client';

import {
	JSX,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent as ReactMouseEvent,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react';
import { XIcon } from 'lucide-react';

import {
	DialogClosePropsType,
	DialogContentPropsType,
	DialogDescriptionPropsType,
	DialogPropsType,
	DialogStoreType,
	DialogTitlePropsType,
	DialogTriggerPropsType,
} from './dialog.type';
import { cn } from '../../utils/styles.util';
import { createAnimatedOverlayStore } from '../../helpers/animated-overlay-store.helper';

import { useReducedMotion } from '../../hooks/useReducedMotion.hook';
import {
	DialogContext,
	useControlledSync,
	useDialogContext,
	useDialogRecord,
	useDialogRecordCleanup,
} from './useDialog.hook';

import { Backdrop } from '../backdrop';
import { Button } from '../button';
import { Container } from '../container';
import { FocusTrap } from '../focus-trap';
import { Portal } from '../portal';
import { Text } from '../text';

/**
 * @description Root element for the Dialog element.
 * @param {DialogPropsType} props - The props for the Dialog component.
 * @returns {JSX.Element} The Dialog component.
 */
export function Dialog({
	open,
	onOpenChange,

	container,
	closeOnBackdropClick = true,
	closeOnEscape = true,
	hideCloseButton = false,

	duration = 150,
	backdropProps,

	children,
}: DialogPropsType): JSX.Element {
	/* Store the animation duration for each dialog id. */
	const [durationsBox] = useState<{
		dialogId: Map<string, number>;
		duration: number;
	}>(() => ({ dialogId: new Map<string, number>(), duration: 150 }));

	/* Create the dialog store. */
	const [store] = useState<DialogStoreType>(() =>
		createAnimatedOverlayStore((dialogId) => durationsBox.dialogId.get(dialogId) ?? durationsBox.duration),
	);

	/* Default id when Trigger/Content/Close do not provide dialogId. */
	const defaultDialogId = useId();

	/* Register the animation duration for a dialog id. */
	const setAnimationDuration = ({
		dialogId,
		duration,
		action,
	}: {
		dialogId: string;
		duration?: number;
		action: 'register' | 'unregister';
	}): void => {
		if (action === 'unregister') durationsBox.dialogId.delete(dialogId);
		else durationsBox.dialogId.set(dialogId, duration ?? durationsBox.duration);
	};

	return (
		<DialogContext.Provider
			value={{
				defaultDialogId,
				store,
				setAnimationDuration,
				container,
				closeOnBackdropClick,
				closeOnEscape,
				hideCloseButton,
				duration,
				backdropProps,
				open,
				onOpenChange,
			}}
		>
			{children}
		</DialogContext.Provider>
	);
}

/**
 * @description A trigger button that opens/toggles a dialog by id.
 * @param {DialogTriggerPropsType} props - The props for the DialogTrigger component.
 * @returns {JSX.Element} The DialogTrigger component.
 */
export function DialogTrigger({
	dialogId: dialogIdProp,
	onClick,
	action = 'open',

	...props
}: DialogTriggerPropsType): JSX.Element {
	const { defaultDialogId, store, open, onOpenChange } = useDialogContext();
	const effectiveDialogId = dialogIdProp ?? defaultDialogId;
	const record = useDialogRecord(effectiveDialogId);

	useControlledSync({
		dialogId: effectiveDialogId,
		isOpen: open,
		open: store.open,
		close: store.close,
	});

	const dialogIsOpen = open ?? (record.isMounted && (record.phase === 'open' || record.phase === 'opening'));

	/* Handle the click event. */
	const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		if (open !== undefined) {
			onOpenChange?.(action === 'toggle' ? !dialogIsOpen : true);
			onClick?.(event);
			return;
		}

		if (action === 'toggle') store.toggle(effectiveDialogId);
		else store.open(effectiveDialogId);
		onClick?.(event);
	};

	return (
		<Button
			onClick={handleClick}
			data-slot="DialogTrigger"
			aria-haspopup="dialog"
			aria-expanded={dialogIsOpen}
			aria-controls={`dialog-${effectiveDialogId}`}
			{...props}
		/>
	);
}

/**
 * @description Dialog UI that renders in a portal and animates in/out.
 * @param {DialogContentPropsType} props - The props for the DialogContent component.
 * @returns {JSX.Element} The DialogContent component.
 */
export function DialogContent({
	dialogId: dialogIdProp,
	onKeyDown,

	style,
	className,

	children,

	...props
}: DialogContentPropsType): JSX.Element {
	/* Get the dialog context. */
	const {
		defaultDialogId,
		store,
		setAnimationDuration,
		open,
		onOpenChange,
		container,
		closeOnBackdropClick,
		closeOnEscape,
		hideCloseButton,
		duration,
		backdropProps,
	} = useDialogContext();
	const effectiveDialogId = dialogIdProp ?? defaultDialogId;
	/* Get the dialog record. */
	const record = useDialogRecord(effectiveDialogId);

	/* Controlled + Uncontrolled sync. */
	useControlledSync({
		dialogId: effectiveDialogId,
		isOpen: open,
		open: store.open,
		close: store.close,
	});

	/* Register the animation duration for the dialog id. */
	useEffect(() => {
		setAnimationDuration({ dialogId: effectiveDialogId, duration, action: 'register' });
		return (): void => {
			setAnimationDuration({ dialogId: effectiveDialogId, action: 'unregister' });
		};
	}, [effectiveDialogId, duration, setAnimationDuration]);

	/* Destroy the store record when this content unmounts, freeing memory. */
	useDialogRecordCleanup(effectiveDialogId);

	/* Ref for the panel element. */
	const dialogContentRef = useRef<HTMLDivElement | null>(null);
	/* Ref for the last focused element. */
	const lastFocusedElementRef = useRef<HTMLElement | null>(null);

	/* Check if the dialog is open like. */
	const isOpenLike = record.isMounted && (record.phase === 'open' || record.phase === 'opening');
	/* Check if the dialog should render. */
	const shouldRender = record.isMounted;

	/* Focus the dialog content when the dialog is open. */
	useEffect(() => {
		if (!isOpenLike) return;

		lastFocusedElementRef.current = (document.activeElement as HTMLElement | null) ?? null;
		const timerId = setTimeout(() => {
			dialogContentRef.current?.focus({ preventScroll: true });
		}, 0);

		return (): void => {
			clearTimeout(timerId);
		};
	}, [isOpenLike]);

	/* Focus the last focused element when the dialog is closed. */
	useEffect(() => {
		if (shouldRender) return;

		const previous = lastFocusedElementRef.current;
		lastFocusedElementRef.current = null;
		previous?.focus?.();
	}, [shouldRender]);

	/* Handle the visibility change of the backdrop. */
	const onVisibilityChange = (): void => {
		if (open === undefined) store.close(effectiveDialogId);
		else onOpenChange?.(false);
	};

	/* Handle the mouse down event on the backdrop. */
	const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
		if (!closeOnBackdropClick) return;
		if (event.target !== event.currentTarget) return;
		onVisibilityChange();
	};

	/* Handle the key down event on the dialog content. */
	const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
		onKeyDown?.(event);

		if (event.key === 'Escape' && closeOnEscape) {
			event.stopPropagation();
			onVisibilityChange();
			return;
		}
	};

	const prefersReducedMotion = useReducedMotion();

	if (!shouldRender) return <></>;

	/* Check if the dialog is visible. */
	const isVisible = record.phase === 'open';
	/* Get the transition duration. */
	const transitionDuration = prefersReducedMotion ? 0 : duration;

	return (
		<Portal container={container}>
			<Backdrop
				visible={isVisible}
				onClick={handleBackdropClick}
				onVisibilityChange={onVisibilityChange}
				closeOnClick={closeOnBackdropClick}
				duration={transitionDuration}
				data-slot="DialogBackdrop"
				{...backdropProps}
			>
				<FocusTrap active={isVisible}>
					<Container
						style={{ transitionDuration: `${transitionDuration}ms` }}
						className={cn(
							'origin-center transform-gpu transition-transform will-change-transform',
							prefersReducedMotion ? 'scale-100' : isVisible ? 'scale-100' : 'scale-95',
						)}
						data-slot="DialogMotion"
					>
						<Container
							ref={(node) => {
								dialogContentRef.current = node;
							}}
							onKeyDown={handleKeyDown}
							style={{ transitionDuration: `${transitionDuration}ms`, ...style }}
							className={cn(
								'relative z-1001 max-h-[85vh] w-[min(92vw,520px)] origin-center transform-gpu overflow-auto rounded-2xl bg-background p-6 shadow-xl transition-opacity will-change-[opacity] outline-none backface-hidden transform-3d',
								isVisible ? 'opacity-100' : 'opacity-0',
								className,
							)}
							data-slot={'DialogContent'}
							role="dialog"
							aria-modal="true"
							tabIndex={-1}
							{...props}
						>
							{!hideCloseButton && <DialogClose dialogId={effectiveDialogId} />}
							{children}
						</Container>
					</Container>
				</FocusTrap>
			</Backdrop>
		</Portal>
	);
}

/**
 * @description A button that closes a specific dialog by id.
 * @param {DialogClosePropsType} props - The props for the DialogClose component.
 * @returns {JSX.Element} The DialogClose component.
 */
export function DialogClose({
	dialogId: dialogIdProp,
	onClick,
	children,
	...props
}: DialogClosePropsType): JSX.Element {
	const { defaultDialogId, store, open, onOpenChange } = useDialogContext();
	const effectiveDialogId = dialogIdProp ?? defaultDialogId;

	const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		if (open !== undefined) {
			onOpenChange?.(false);
			onClick?.(event);
			return;
		}

		store.close(effectiveDialogId);
		onClick?.(event);
	};

	return (
		<Button
			onClick={handleClick}
			variant="ghost"
			size="icon-sm"
			className="absolute top-1.5 right-1.5 hover:bg-danger-light hover:text-danger"
			data-slot="DialogClose"
			aria-label="Close dialog"
			aria-controls={`dialog-${effectiveDialogId}`}
			{...props}
		>
			{children ?? <XIcon className="size-4" />}
		</Button>
	);
}

/**
 * @description Title wrapper used to display content in a dialog format.
 * @returns {JSX.Element} The DialogTitle component.
 */
export function DialogTitle({ as = 'title', ...props }: DialogTitlePropsType): JSX.Element {
	return <Text as={as} data-slot="dialog-title" {...props} />;
}

/**
 * @description Description wrapper used to display content in a dialog format.
 * @returns {JSX.Element} The DialogDescription component.
 */
export function DialogDescription({ as = 'subtitle', className, ...props }: DialogDescriptionPropsType): JSX.Element {
	return (
		<Text
			as={as}
			data-slot="dialog-description"
			className={cn('scroll-mt-0.5 font-medium text-muted-foreground', className)}
			{...props}
		/>
	);
}
