'use client';

import { JSX, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, useState } from 'react';
import { StarIcon } from 'lucide-react';

import { RatingPropsType } from './rating.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';
import { resolveRatingValueFromPointer, stepRatingValue } from './rating.helper';

import { Container } from '../container';

/** Variants for the Rating component. */
export const { variants: ratingVariants, types: RatingVariantTypes } = makeVariants({
	base: 'inline-flex items-center gap-0.5 rounded-sm outline-2 outline-offset-2 outline-transparent focus-visible:outline-primary',
	variants: {
		size: {
			sm: '[&_svg]:size-4',
			default: '[&_svg]:size-5',
			lg: '[&_svg]:size-6',
			xl: '[&_svg]:size-7',
		},
	},
	default: {
		size: 'default',
	},
});

/**
 * @description Star-based input for collecting or displaying a rating, with optional half-icon precision.
 * @returns {JSX.Element} The Rating component.
 */
export function Rating({
	value,
	defaultValue = 0,
	onValueChange,

	max = 5,
	precision = 1,
	readOnly,
	disabled,
	size = 'default',
	className,

	'aria-label': ariaLabel = 'Rating',
	...props
}: RatingPropsType): JSX.Element {
	const [internalValue, setInternalValue] = useState<number>(defaultValue);
	const [hoverValue, setHoverValue] = useState<number | null>(null);

	const currentValue = value ?? internalValue;
	const displayValue = hoverValue ?? currentValue;
	const isInteractive = !readOnly && !disabled;

	const commitValue = (nextValue: number): void => {
		if (nextValue === currentValue) return;
		onValueChange?.(nextValue);
		if (value === undefined) setInternalValue(nextValue);
	};

	const handlePointerIntent = (event: ReactMouseEvent<HTMLDivElement>, intent: 'hover' | 'commit'): void => {
		if (!isInteractive) return;

		const itemElement = (event.target as HTMLElement).closest<HTMLElement>('[data-slot="rating-item"]');
		if (!itemElement) return;

		const index = Number(itemElement.dataset.ratingIndex);
		if (Number.isNaN(index)) return;

		const nextValue = resolveRatingValueFromPointer({
			index,
			clientX: event.clientX,
			itemElement,
			precision,
		});

		if (intent === 'hover') setHoverValue(nextValue);
		else commitValue(nextValue);
	};

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
		if (!isInteractive) return;

		if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
			event.preventDefault();
			commitValue(stepRatingValue({ value: currentValue, delta: precision, max }));
			return;
		}

		if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
			event.preventDefault();
			commitValue(stepRatingValue({ value: currentValue, delta: -precision, max }));
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			commitValue(0);
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			commitValue(max);
		}
	};

	return (
		<Container
			{...props}
			className={cn(
				ratingVariants({ size }),
				isInteractive && 'cursor-pointer',
				disabled && 'pointer-events-none opacity-50',
				className,
			)}
			data-slot="rating"
			role="slider"
			aria-label={ariaLabel}
			aria-orientation="horizontal"
			aria-valuemin={0}
			aria-valuemax={max}
			aria-valuenow={currentValue}
			aria-valuetext={`${currentValue} out of ${max}`}
			aria-readonly={readOnly || undefined}
			aria-disabled={disabled || undefined}
			tabIndex={isInteractive ? 0 : -1}
			onKeyDown={handleKeyDown}
			onMouseMove={(event) => handlePointerIntent(event, 'hover')}
			onMouseLeave={() => setHoverValue(null)}
			onClick={(event) => handlePointerIntent(event, 'commit')}
		>
			{Array.from({ length: max }, (_, index) => {
				const fillRatio = Math.max(0, Math.min(1, displayValue - index));

				return (
					<Container
						key={index}
						className="relative"
						data-slot="rating-item"
						data-rating-index={index}
						aria-hidden="true"
					>
						<StarIcon className="text-muted" aria-hidden="true" />
						<Container
							style={{ width: `${fillRatio * 100}%` }}
							className="absolute inset-y-0 left-0 overflow-hidden"
							aria-hidden="true"
						>
							<StarIcon className="fill-warn text-warn" />
						</Container>
					</Container>
				);
			})}
		</Container>
	);
}
