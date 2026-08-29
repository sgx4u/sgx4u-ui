'use client';

import { JSX, useState } from 'react';
import { Controller } from 'react-hook-form';

import { InputModulePropsType } from './input-module.type';
import { cn } from '../../utils/styles.util';

import { Container } from '../../elements/container';
import { Icons } from '../../elements/icons';
import { Input } from '../../elements/input';
import { Label } from '../../elements/label';
import { Text } from '../../elements/text';

/**
 * @description Composed input with label, validation message, and optional password visibility toggle.
 * @param {InputModulePropsType} props - The props for the InputModule component.
 * @returns {JSX.Element} The InputModule component.
 */
export function InputModule({
	id,
	control,
	name,
	type,
	title,
	state = 'default',

	label,
	labelClassName,

	message,
	messageClassName,

	className,
	passwordIconClassName,
	containerClassName,

	innerElement,
	labelProps,
	passwordIconProps,
	...inputProps
}: InputModulePropsType): JSX.Element {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const inputId = id ?? name;
	const messageId = message && inputId ? `${inputId}-message` : undefined;

	/**
	 * @description Renders the shared input element for both controlled and uncontrolled modes.
	 * @param {object} [fieldProps] - Optional react-hook-form field props to merge onto the input.
	 * @returns {JSX.Element} The input element.
	 */
	function renderInput(fieldProps?: Record<string, unknown>): JSX.Element {
		return (
			<Input
				id={inputId}
				name={name ?? 'input-module'}
				type={type === 'password' && isPasswordVisible ? 'text' : type}
				title={title ?? (typeof label === 'string' ? label : name)}
				state={state}
				aria-describedby={messageId}
				className={cn(type === 'password' && 'pr-10', className)}
				{...inputProps}
				{...fieldProps}
			/>
		);
	}

	return (
		<Container className={cn('flex w-full flex-col gap-1', containerClassName)}>
			{label && (
				<Label
					variant="muted"
					{...labelProps}
					htmlFor={inputId}
					required={inputProps.required}
					className={labelClassName}
				>
					{label}
				</Label>
			)}

			<Container className="relative w-full">
				{control && name ? (
					<Controller control={control} name={name} render={({ field }) => renderInput(field)} />
				) : (
					renderInput()
				)}

				{type === 'password' && (
					<Icons
						{...passwordIconProps}
						variant="password-show-hide"
						visible={isPasswordVisible}
						onVisibleChange={setIsPasswordVisible}
						className={cn('absolute inset-y-0 right-2.5 my-auto size-5', passwordIconClassName)}
					/>
				)}

				{innerElement}
			</Container>

			{message && (
				<Text
					id={messageId}
					as="body-small"
					variant={state === 'default' ? 'muted' : state}
					className={messageClassName}
				>
					{message}
				</Text>
			)}
		</Container>
	);
}
