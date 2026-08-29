'use client';

import { JSX, MouseEvent as ReactMouseEvent, useContext, useEffect, useId, useState } from 'react';
import { XIcon } from 'lucide-react';

import {
	SheetClosePropsType,
	SheetContentPropsType,
	SheetDescriptionPropsType,
	SheetPropsType,
	SheetStoreType,
	SheetTitlePropsType,
	SheetTriggerPropsType,
} from './sheet.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';
import { createAnimatedOverlayStore } from '../../helpers/animated-overlay-store.helper';

import { useLockScroll } from '../../hooks/useLockScroll.hook';
import { useReducedMotion } from '../../hooks/useReducedMotion.hook';
import {
	SheetContentContext,
	SheetContext,
	useControlledSync,
	useSheetContext,
	useSheetRecord,
	useSheetRecordCleanup,
} from './useSheet.hook';

import { Backdrop } from '../backdrop';
import { Button } from '../button';
import { Container } from '../container';
import { FocusTrap } from '../focus-trap';
import { Portal } from '../portal';
import { Text } from '../text';

/**
 * @description A panel that slides in from the edge of the screen to display contextual content without leaving the current page.
 * @returns {JSX.Element} The Sheet component.
 */
export function Sheet({
	open,
	onOpenChange,
	closeOnBackdropClick = true,
	animationSpeed = 400,
	backdropProps,

	children,
}: SheetPropsType): JSX.Element {
	/* Store the animation duration for each sheet id. */
	const [durationsBox] = useState<{ sheetId: Map<string, number>; duration: number }>(() => ({
		sheetId: new Map<string, number>(),
		duration: 400,
	}));

	/* Create the sheet store. */
	const [store] = useState<SheetStoreType>(() =>
		createAnimatedOverlayStore((sheetId) => durationsBox.sheetId.get(sheetId) ?? durationsBox.duration),
	);

	/* Default id when Trigger/Content/Close do not provide sheetId. */
	const defaultSheetId = useId();

	/* Register the animation duration for a sheet id. */
	const setAnimationDuration = ({
		sheetId,
		duration,
		action,
	}: {
		sheetId: string;
		duration?: number;
		action: 'register' | 'unregister';
	}): void => {
		if (action === 'unregister') durationsBox.sheetId.delete(sheetId);
		else durationsBox.sheetId.set(sheetId, duration ?? durationsBox.duration);
	};

	return (
		<SheetContext.Provider
			value={{
				defaultSheetId,
				store,
				setAnimationDuration,
				open,
				onOpenChange,
				closeOnBackdropClick,
				animationSpeed,
				backdropProps,
			}}
		>
			{children}
		</SheetContext.Provider>
	);
}

/**
 * @description Button trigger that toggles the associated sheet open state while preserving any custom click handlers and wiring ARIA dialog affordances.
 * @returns {JSX.Element} The SheetTrigger component.
 */
export function SheetTrigger({
	sheetId: sheetIdProp,
	onClick,
	children,
	...props
}: SheetTriggerPropsType): JSX.Element {
	const { defaultSheetId, store, open, onOpenChange } = useSheetContext();
	const effectiveSheetId = sheetIdProp ?? defaultSheetId;

	const record = useSheetRecord(effectiveSheetId);

	/* Controlled + Uncontrolled sync. */
	useControlledSync({
		sheetId: effectiveSheetId,
		isOpen: open,
		open: store.open,
		close: store.close,
	});

	const isOpen = open ?? (record.isMounted && (record.phase === 'open' || record.phase === 'opening'));

	const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		if (open !== undefined) {
			onOpenChange?.(!isOpen);
			onClick?.(event);
			return;
		}

		store.toggle(effectiveSheetId);
		onClick?.(event);
	};

	return (
		<Button
			onClick={handleClick}
			data-slot="sheet-trigger"
			aria-haspopup="dialog"
			aria-expanded={isOpen}
			aria-controls={`sheet-${effectiveSheetId}`}
			{...props}
		>
			{children}
		</Button>
	);
}

export const { variants: sheetContentVariants, types: SheetContentVariantTypes } = makeVariants({
	base: 'relative bg-background p-6',
	variants: {
		side: {
			top: 'mb-auto h-full max-h-1/3 w-full',
			right: 'ml-auto h-dvh w-full max-w-sm',
			bottom: 'mt-auto h-full max-h-1/3 w-full',
			left: 'mr-auto h-dvh w-full max-w-sm',
		},
	},
	default: {
		side: 'right',
	},
});

/** Per-side translate classes applied when the sheet is not visible (closing or opening phase). */
const closedTranslateClass: Record<NonNullable<SheetContentPropsType['side']>, string> = {
	top: '-translate-y-full',
	right: 'translate-x-full',
	bottom: 'translate-y-full',
	left: '-translate-x-full',
};

/**
 * @description Fixed viewport overlay that houses the animated sheet panel, applies side-specific entrance transitions, and mounts a synchronized backdrop.
 * @returns {JSX.Element} The SheetContent component.
 */
export function SheetContent({
	sheetId: sheetIdProp,
	className,
	side = 'right',
	children,
	...props
}: SheetContentPropsType): JSX.Element {
	const {
		defaultSheetId,
		store,
		setAnimationDuration,
		open,
		onOpenChange,
		closeOnBackdropClick,
		backdropProps,
		animationSpeed,
	} = useSheetContext();
	const effectiveSheetId = sheetIdProp ?? defaultSheetId;

	/* Accessible name/description wiring: only reference ids that actually render. */
	const titleId = `sheet-title-${effectiveSheetId}`;
	const descriptionId = `sheet-description-${effectiveSheetId}`;
	const [hasTitle, setHasTitle] = useState(false);
	const [hasDescription, setHasDescription] = useState(false);

	const record = useSheetRecord(effectiveSheetId);

	/* Controlled + Uncontrolled sync. */
	useControlledSync({
		sheetId: effectiveSheetId,
		isOpen: open,
		open: store.open,
		close: store.close,
	});

	/* Register animation duration so the store knows how long to wait before unmounting. */
	useEffect(() => {
		setAnimationDuration({ sheetId: effectiveSheetId, duration: animationSpeed, action: 'register' });
		return (): void => {
			setAnimationDuration({ sheetId: effectiveSheetId, action: 'unregister' });
		};
	}, [effectiveSheetId, animationSpeed, setAnimationDuration]);

	/* Destroy the store record when this content unmounts, freeing memory. */
	useSheetRecordCleanup(effectiveSheetId);

	const prefersReducedMotion = useReducedMotion();
	const effectiveAnimationSpeed = prefersReducedMotion ? 0 : animationSpeed;

	/* Derive rendering flags from the store record. */
	const shouldRender = record.isMounted;
	const isOpenLike = record.isMounted && (record.phase === 'open' || record.phase === 'opening');
	const isVisible = record.phase === 'open';

	/* Lock body scroll while the sheet is open or animating in. */
	useLockScroll(isOpenLike);

	/* Handle close — routes through the store or controlled callback. */
	const handleClose = (): void => {
		if (open === undefined) store.close(effectiveSheetId);
		else onOpenChange?.(false);
	};

	if (!shouldRender) return <></>;

	return (
		<Portal>
			<FocusTrap active={isOpenLike}>
				<Container className="fixed inset-0 z-overlay flex" data-slot="sheet-overlay">
					<Container
						id={`sheet-${effectiveSheetId}`}
						style={{ transitionDuration: `${effectiveAnimationSpeed}ms` }}
						className={cn(
							'z-top transition-[opacity,translate]',
							sheetContentVariants({ side }),
							isVisible
								? 'translate-x-0 translate-y-0 opacity-100'
								: cn('pointer-events-none opacity-0', closedTranslateClass[side]),
							className,
						)}
						data-slot="sheet-content"
						role="dialog"
						aria-modal="true"
						aria-labelledby={hasTitle ? titleId : undefined}
						aria-describedby={hasDescription ? descriptionId : undefined}
						{...props}
					>
						<SheetContentContext.Provider
							value={{
								titleId,
								descriptionId,
								registerTitle: setHasTitle,
								registerDescription: setHasDescription,
							}}
						>
							{children}
						</SheetContentContext.Provider>
					</Container>

					<Backdrop
						visible={isVisible}
						onVisibilityChange={handleClose}
						closeOnClick={closeOnBackdropClick}
						style={{ transitionDuration: `${effectiveAnimationSpeed}ms` }}
						{...backdropProps}
					/>
				</Container>
			</FocusTrap>
		</Portal>
	);
}

/**
 * @description Heading element for the sheet.
 * @returns {JSX.Element} The SheetTitle component.
 */
export function SheetTitle({ as = 'title', ...props }: SheetTitlePropsType): JSX.Element {
	const contentContext = useContext(SheetContentContext);
	const registerTitle = contentContext?.registerTitle;

	useEffect(() => {
		registerTitle?.(true);
		return (): void => registerTitle?.(false);
	}, [registerTitle]);

	return <Text as={as} id={contentContext?.titleId} data-slot="sheet-title" {...props} />;
}

/**
 * @description Supporting text block for the sheet.
 * @returns {JSX.Element} The SheetDescription component.
 */
export function SheetDescription({ as = 'body-small', className, ...props }: SheetDescriptionPropsType): JSX.Element {
	const contentContext = useContext(SheetContentContext);
	const registerDescription = contentContext?.registerDescription;

	useEffect(() => {
		registerDescription?.(true);
		return (): void => registerDescription?.(false);
	}, [registerDescription]);

	return (
		<Text
			as={as}
			id={contentContext?.descriptionId}
			className={cn('text-muted-foreground', className)}
			data-slot="sheet-description"
			{...props}
		/>
	);
}

/**
 * @description Icon button that closes the sheet, with hover affordances and a screen-reader-only label for accessible dismissal.
 * @returns {JSX.Element} The SheetClose component.
 */
export function SheetClose({
	sheetId: sheetIdProp,
	onClick,
	className,
	children,
	...props
}: SheetClosePropsType): JSX.Element {
	const { defaultSheetId, store, open, onOpenChange } = useSheetContext();
	const effectiveSheetId = sheetIdProp ?? defaultSheetId;

	const handleClick = (event: ReactMouseEvent<HTMLButtonElement>): void => {
		if (open !== undefined) {
			onOpenChange?.(false);
			onClick?.(event);
			return;
		}

		store.close(effectiveSheetId);
		onClick?.(event);
	};

	return (
		<Button
			onClick={handleClick}
			variant="ghost"
			size="icon"
			className={cn('absolute top-4 right-4 size-6 hover:bg-danger-light hover:text-danger', className)}
			data-slot="sheet-close"
			aria-label="Close sheet"
			aria-controls={`sheet-${effectiveSheetId}`}
			{...props}
		>
			{children ?? <XIcon />}
		</Button>
	);
}
