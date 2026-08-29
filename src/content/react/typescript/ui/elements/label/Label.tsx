import { JSX } from 'react';

import { LabelPropsType } from './label.type';
import { cn } from '../../utils/styles.util';
import { makeVariants } from '../../utils/variant.util';

import { Container } from '../container';
import { Indicators } from '../indicators/Indicators';
import { Slot } from '../slot';

/** Variants for the Label component. */
export const { variants: labelVariants, types: LabelVariantTypes } = makeVariants({
	base: `w-max space-x-1 text-sm leading-none font-medium group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:pointer-events-none peer-disabled:opacity-50`,
	variants: {
		variant: {
			default: 'text-foreground',
			success: 'text-success',
			warn: 'text-warn',
			danger: 'text-danger',
			muted: 'text-muted-foreground',
		},
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
		state: {
			default: '',
			danger: 'text-danger',
			success: 'text-success',
			warn: 'text-warn',
		},
	},
	default: {
		variant: 'default',
		size: 'default',
	},
});

/**
 * @description Text caption that describes and links to a form control, often showing required or validation state.
 * @returns {JSX.Element} The Label component.
 */
export function Label({
	asChild,
	htmlFor,
	message,
	state = 'default',
	disabled = false,
	required,
	requiredIndicator = <Indicators variant="star" />,

	variant = 'default',
	size = 'default',
	className,

	children,
	...props
}: LabelPropsType): JSX.Element {
	/** If particular state is mentioned, then update the variants accordingly. */
	const actualVariant = state === 'default' ? variant : state;

	const componentProps = {
		'data-slot': 'label',
		...props,
		htmlFor,
		className: cn(
			labelVariants({ variant: actualVariant, size }),
			disabled && 'pointer-events-none opacity-50',
			className,
		),
		'aria-required': required || undefined,
		'aria-invalid': state === 'danger' || undefined,
		'aria-disabled': disabled || undefined,
	} as const;

	/** If asChild is true, merge props with the child element (no new DOM node). */
	if (asChild) return <Slot {...componentProps} />;

	return (
		<label {...componentProps}>
			{/* Visual + screen-reader accessible required indicator. */}
			{required && (
				<>
					{requiredIndicator}
					<Container as="span" className="sr-only">
						Required.
					</Container>
				</>
			)}

			{message ?? children}
		</label>
	);
}
