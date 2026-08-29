'use client';

import { JSX, ChangeEvent as ReactChangeEvent, KeyboardEvent as ReactKeyboardEvent, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';

import {
	PaginationContentPropsType,
	PaginationInputPropsType,
	PaginationItemPropsType,
	PaginationLinkPropsType,
	PaginationPreviousNextPropsType,
	PaginationPropsType,
} from './pagination.type';
import { cn } from '../../utils/styles.util';
import { getPaginationWindow, resolvePaginationPageNumber } from './pagination.helper';

import { Button } from '../button';
import { Container } from '../container';
import { Input } from '../input';

/**
 * @description Navigation region for moving between pages of content. When "page" and "totalPages" are provided, renders Previous/Next with a windowed page list; pass children (such as PaginationInput) to replace the active page control while keeping side pages. Without those props, compose PaginationContent/PaginationItem/PaginationLink manually.
 * @returns {JSX.Element} The Pagination component.
 */
export function Pagination({
	page,
	totalPages,
	onPageChange,
	siblingCount = 1,
	className,
	children,
	...props
}: PaginationPropsType): JSX.Element {
	const isAutomatic = page !== undefined && totalPages !== undefined && onPageChange !== undefined;

	return (
		<Container
			className={cn('flex items-center justify-center', className)}
			data-slot="pagination"
			role="navigation"
			aria-label="Pagination"
			{...props}
		>
			{isAutomatic ? (
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
					</PaginationItem>

					{getPaginationWindow({ page, totalPages, siblingCount }).map((item, index) => {
						if (item === 'ellipsis') {
							return (
								<PaginationItem key={`ellipsis-${index}`}>
									<PaginationEllipsis />
								</PaginationItem>
							);
						}

						if (children && item === page) {
							return <PaginationItem key={item}>{children}</PaginationItem>;
						}

						return (
							<PaginationItem key={item}>
								<PaginationLink isActive={item === page} onClick={() => onPageChange(item)}>
									{item}
								</PaginationLink>
							</PaginationItem>
						);
					})}

					<PaginationItem>
						<PaginationNext disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
					</PaginationItem>
				</PaginationContent>
			) : (
				children
			)}
		</Container>
	);
}

/**
 * @description Row that lays out the pagination items.
 * @returns {JSX.Element} The PaginationContent component.
 */
export function PaginationContent({ className, ...props }: PaginationContentPropsType): JSX.Element {
	return (
		<Container
			as="span"
			className={cn('flex items-center gap-1', className)}
			data-slot="pagination-content"
			{...props}
		/>
	);
}

/**
 * @description Wrapper for a single pagination control.
 * @returns {JSX.Element} The PaginationItem component.
 */
export function PaginationItem({ className, ...props }: PaginationItemPropsType): JSX.Element {
	return <Container as="span" className={className} data-slot="pagination-item" {...props} />;
}

/**
 * @description Clickable page number control.
 * @returns {JSX.Element} The PaginationLink component.
 */
export function PaginationLink({
	isActive,
	variant,
	size = 'icon-sm',
	className,
	...props
}: PaginationLinkPropsType): JSX.Element {
	return (
		<Button
			variant={variant ?? (isActive ? 'primary' : 'ghost')}
			size={size}
			className={className}
			data-slot="pagination-link"
			aria-current={isActive ? 'page' : undefined}
			{...props}
		/>
	);
}

/**
 * @description Control that navigates to the previous page.
 * @returns {JSX.Element} The PaginationPrevious component.
 */
export function PaginationPrevious({
	variant = 'ghost',
	size = 'icon-sm',
	className,
	children,
	...props
}: PaginationPreviousNextPropsType): JSX.Element {
	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			data-slot="pagination-previous"
			aria-label="Go to previous page"
			{...props}
		>
			{children ?? <ChevronLeftIcon />}
		</Button>
	);
}

/**
 * @description Control that navigates to the next page.
 * @returns {JSX.Element} The PaginationNext component.
 */
export function PaginationNext({
	variant = 'ghost',
	size = 'icon-sm',
	className,
	children,
	...props
}: PaginationPreviousNextPropsType): JSX.Element {
	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			data-slot="pagination-next"
			aria-label="Go to next page"
			{...props}
		>
			{children ?? <ChevronRightIcon />}
		</Button>
	);
}

/**
 * @description Non-interactive placeholder representing a run of skipped pages.
 * @returns {JSX.Element} The PaginationEllipsis component.
 */
export function PaginationEllipsis(): JSX.Element {
	return (
		<Container
			as="span"
			className="flex size-8 items-center justify-center text-muted-foreground"
			data-slot="pagination-ellipsis"
			aria-hidden="true"
		>
			<MoreHorizontalIcon className="size-4" />
		</Container>
	);
}

/**
 * @description Input that lets users type a page number and press Enter to navigate to that page.
 * @returns {JSX.Element} The PaginationInput component.
 */
export function PaginationInput({
	page,
	totalPages,
	onPageChange,
	name = 'pagination-page',
	className,
	'aria-label': ariaLabel = 'Go to page',
	...props
}: PaginationInputPropsType): JSX.Element {
	const [draftValue, setDraftValue] = useState(page === undefined ? '' : String(page));
	const [syncedPage, setSyncedPage] = useState(page);

	/** Keep the draft value aligned when the active page changes from outside the input. */
	if (page !== undefined && page !== syncedPage) {
		setSyncedPage(page);
		setDraftValue(String(page));
	}

	/**
	 * @description Updates the draft value as the user types.
	 * @param {ReactChangeEvent<HTMLInputElement>} event - The change event.
	 * @returns {void}
	 */
	const handleChange = (event: ReactChangeEvent<HTMLInputElement>): void => {
		setDraftValue(event.target.value);
	};

	/**
	 * @description Navigates to the typed page when Enter is pressed.
	 * @param {ReactKeyboardEvent<HTMLInputElement>} event - The keyboard event.
	 * @returns {void}
	 */
	const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
		if (event.key !== 'Enter') return;

		event.preventDefault();

		const nextPage = resolvePaginationPageNumber({ value: draftValue, totalPages });
		if (nextPage === undefined) {
			if (page !== undefined) setDraftValue(String(page));
			return;
		}

		setDraftValue(String(nextPage));
		if (nextPage !== page) onPageChange(nextPage);
	};

	return (
		<Input
			{...props}
			name={name}
			type="text"
			inputMode="numeric"
			pattern="[0-9]*"
			autoComplete="off"
			inputSize="sm"
			value={draftValue}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			aria-label={ariaLabel}
			className={cn(
				'field-sizing-content h-8 w-auto max-w-none min-w-8 text-center text-base font-medium',
				className,
			)}
			size={Math.max(1, draftValue.length || 1)}
			data-slot="pagination-input"
		/>
	);
}
