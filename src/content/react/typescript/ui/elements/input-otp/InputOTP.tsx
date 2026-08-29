'use client';

import {
	JSX,
	ClipboardEvent as ReactClipboardEvent,
	KeyboardEvent as ReactKeyboardEvent,
	useRef,
	useState,
} from 'react';

import { InputOTPPropsType } from './input-otp.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../container';
import { Input } from '../input';

/**
 * @description Group of single-character inputs for entering one-time passcodes, with automatic caret advancement and paste support.
 * @returns {JSX.Element} The InputOTP component.
 */
export function InputOTP({
	name,
	length = 6,
	value,
	defaultValue = '',
	onChange,
	onComplete,

	disabled,
	state = 'default',
	className,

	'aria-label': ariaLabel = 'One-time passcode',
	...props
}: InputOTPPropsType): JSX.Element {
	const [internalValue, setInternalValue] = useState<string>(defaultValue);

	const slotRefs = useRef<Array<HTMLInputElement | null>>([]);

	const currentValue = value ?? internalValue;

	const commitValue = (nextValue: string): void => {
		onChange?.(nextValue);
		if (value === undefined) setInternalValue(nextValue);
		if (nextValue.length === length) onComplete?.(nextValue);
	};

	const handleSlotChange = (index: number, rawCharacter: string): void => {
		const character = rawCharacter.slice(0, 1);
		const nextValue = currentValue.slice(0, index) + character + currentValue.slice(index + 1);
		commitValue(nextValue.slice(0, length));

		if (character) slotRefs.current[index + 1]?.focus();
	};

	const handleKeyDown =
		(index: number) =>
		(event: ReactKeyboardEvent<HTMLInputElement>): void => {
			if (event.key === 'Backspace' && !currentValue[index] && index > 0) {
				event.preventDefault();
				slotRefs.current[index - 1]?.focus();
				commitValue(currentValue.slice(0, index - 1) + currentValue.slice(index));
				return;
			}

			if (event.key === 'ArrowLeft' && index > 0) {
				event.preventDefault();
				slotRefs.current[index - 1]?.focus();
			} else if (event.key === 'ArrowRight' && index < length - 1) {
				event.preventDefault();
				slotRefs.current[index + 1]?.focus();
			}
		};

	const handlePaste = (event: ReactClipboardEvent<HTMLInputElement>): void => {
		event.preventDefault();
		const pastedValue = event.clipboardData.getData('text').slice(0, length);
		commitValue(pastedValue);
		slotRefs.current[Math.min(pastedValue.length, length - 1)]?.focus();
	};

	return (
		<Container
			className={cn('flex items-center gap-1', className)}
			data-slot="input-otp"
			role="group"
			aria-label={ariaLabel}
			{...props}
		>
			{Array.from({ length }, (_, index) => (
				<Input
					key={index}
					ref={(element) => {
						slotRefs.current[index] = element;
					}}
					name={`${name}-${index}`}
					value={currentValue[index] ?? ''}
					onChange={(event) => handleSlotChange(index, event.target.value.slice(-1))}
					onKeyDown={handleKeyDown(index)}
					onPaste={handlePaste}
					disabled={disabled}
					state={state}
					maxLength={1}
					inputSize="lg"
					className="aspect-square min-h-5 w-8 min-w-5 p-2 text-center font-medium"
					data-slot="input-otp-slot"
					aria-label={`Character ${index + 1} of ${length}`}
				/>
			))}
		</Container>
	);
}
