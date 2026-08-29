'use client';

import {
	JSX,
	KeyboardEvent as ReactKeyboardEvent,
	MouseEvent as ReactMouseEvent,
	useContext,
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
	DialogContentContext,
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
			data-slot="dialog-trigger"
			aria-haspopup="dialog"
			aria-expanded={dialogIsOpen}
			aria-controls={`dialog-${effectiveDialogId}`}
			{...props}
		/>
	);
}

/**
 * @description Dialog UI that renders in a portal and animates in/out.
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

	const dialogContentRef = useRef<HTMLDivElement | null>(null);
	const lastFocusedElementRef = useRef<HTMLElement | null>(null);

	/* Accessible name/description wiring: only reference ids that actually render. */
	const titleId = `dialog-title-${effectiveDialogId}`;
	const descriptionId = `dialog-description-${effectiveDialogId}`;
	const [hasTitle, setHasTitle] = useState(false);
	const [hasDescription, setHasDescription] = useState(false);

	const isOpenLike = record.isMounted && (record.phase === 'open' || record.phase === 'opening');
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

	const onVisibilityChange = (): void => {
		if (open === undefined) store.close(effectiveDialogId);
		else onOpenChange?.(false);
	};

	const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
		if (!closeOnBackdropClick) return;
		if (event.target !== event.currentTarget) return;
		onVisibilityChange();
	};

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

	const isVisible = record.phase === 'open';
	const transitionDuration = prefersReducedMotion ? 0 : duration;

	return (
		<Portal container={container}>
			<Backdrop
				visible={isVisible}
				onClick={handleBackdropClick}
				onVisibilityChange={onVisibilityChange}
				closeOnClick={closeOnBackdropClick}
				closeOnEscape={false}
				duration={transitionDuration}
				data-slot="dialog-backdrop"
				{...backdropProps}
			>
				<FocusTrap active={isVisible}>
					<Container
						style={{ transitionDuration: `${transitionDuration}ms` }}
						className={cn(
							'origin-center transform-gpu overflow-visible transition-transform will-change-transform',
							prefersReducedMotion ? 'scale-100' : isVisible ? 'scale-100' : 'scale-95',
						)}
						data-slot="dialog-motion"
					>
						<Container
							ref={(node) => {
								dialogContentRef.current = node;
							}}
							id={`dialog-${effectiveDialogId}`}
							onKeyDown={handleKeyDown}
							style={{ transitionDuration: `${transitionDuration}ms`, ...style }}
							className={cn(
								'relative z-top max-h-[85vh] w-[min(92vw,520px)] origin-center transform-gpu overflow-auto rounded-2xl bg-background p-6 shadow-xl transition-opacity will-change-[opacity] outline-none backface-hidden transform-3d',
								isVisible ? 'opacity-100' : 'opacity-0',
								className,
							)}
							data-slot="dialog-content"
							role="dialog"
							aria-modal="true"
							aria-labelledby={hasTitle ? titleId : undefined}
							aria-describedby={hasDescription ? descriptionId : undefined}
							tabIndex={-1}
							{...props}
						>
							<DialogContentContext.Provider
								value={{
									titleId,
									descriptionId,
									registerTitle: setHasTitle,
									registerDescription: setHasDescription,
								}}
							>
								{!hideCloseButton && <DialogClose dialogId={effectiveDialogId} />}
								{children}
							</DialogContentContext.Provider>
						</Container>
					</Container>
				</FocusTrap>
			</Backdrop>
		</Portal>
	);
}

/**
 * @description A button that closes a specific dialog by id.
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
			data-slot="dialog-close"
			aria-label="Close dialog"
			aria-controls={`dialog-${effectiveDialogId}`}
			{...props}
		>
			{children ?? <XIcon />}
		</Button>
	);
}

/**
 * @description Title wrapper that labels the dialog for assistive technology.
 * @returns {JSX.Element} The DialogTitle component.
 */
export function DialogTitle({ as = 'title', ...props }: DialogTitlePropsType): JSX.Element {
	const contentContext = useContext(DialogContentContext);
	const registerTitle = contentContext?.registerTitle;

	useEffect(() => {
		registerTitle?.(true);
		return (): void => registerTitle?.(false);
	}, [registerTitle]);

	return <Text as={as} id={contentContext?.titleId} data-slot="dialog-title" {...props} />;
}

/**
 * @description Description wrapper that describes the dialog for assistive technology.
 * @returns {JSX.Element} The DialogDescription component.
 */
export function DialogDescription({ as = 'subtitle', className, ...props }: DialogDescriptionPropsType): JSX.Element {
	const contentContext = useContext(DialogContentContext);
	const registerDescription = contentContext?.registerDescription;

	useEffect(() => {
		registerDescription?.(true);
		return (): void => registerDescription?.(false);
	}, [registerDescription]);

	return (
		<Text
			as={as}
			id={contentContext?.descriptionId}
			data-slot="dialog-description"
			className={cn('scroll-mt-0.5 font-medium text-muted-foreground', className)}
			{...props}
		/>
	);
}
