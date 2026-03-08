import { JSX, useState } from 'react';
import { Controller } from 'react-hook-form';

import { InputModulePropsType } from './input-module.type';
import { cn } from '../../utils/styles.util';

import { Icons } from '../../elements/icons';
import { Input } from '../../elements/input';
import { Label } from '../../elements/label';

/**
 * @description Input module component.
 * @param {InputModulePropsType} props - The properties object.
 * @returns {JSX.Element} The InputModule component.
 */
export const InputModule = ({
	control,

	label,
	labelClassName,

	message,
	messageClassName,
	state,

	passwordIconClassName,

	innerElement,
	containerClassName,

	labelProps,
	passwordIconProps,
	...props
}: InputModulePropsType): JSX.Element => {
	const { name, value, onChange, type, placeholder, className, ...inputProps } = props;

	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const inputActiveClassName = cn(
		'input',
		`${state === 'error' ? 'input-error' : state === 'success' ? 'input-success' : 'input-default'}`,
		className,
	);

	return (
		<div className={cn('flex w-full flex-col gap-1', containerClassName)}>
			{label && (
				<Label
					title={name}
					htmlFor={name}
					className={cn('text-muted-foreground', labelClassName)}
					{...labelProps}
				>
					{label}
				</Label>
			)}

			<div className="relative size-full">
				{control && name ? (
					<Controller
						control={control}
						name={name}
						render={({ field }) => (
							<Input
								id={name}
								type={type === 'password' && isPasswordVisible ? 'text' : type}
								title={label && typeof label === 'string' ? label : name}
								placeholder={placeholder}
								state={state}
								className={inputActiveClassName}
								{...field}
								{...inputProps}
							/>
						)}
					/>
				) : (
					<Input
						name={name}
						value={value}
						onChange={onChange}
						type={type === 'password' && isPasswordVisible ? 'text' : type}
						title={label && typeof label === 'string' ? label : name}
						placeholder={placeholder}
						className={inputActiveClassName}
						{...inputProps}
					/>
				)}

				{type === 'password' && (
					<Icons
						variant="password-show-hide"
						visible={isPasswordVisible}
						onVisibleChange={setIsPasswordVisible}
						className={cn('absolute inset-[0_10px_0_auto] my-auto size-5', passwordIconClassName)}
						{...passwordIconProps}
					/>
				)}

				{innerElement}
			</div>

			{message && (
				<p
					id={state === 'error' ? `${name}-error` : `${name}-success`}
					className={cn(
						'input-message',
						`${state === 'error' ? 'input-error-message' : state === 'success' ? 'input-success-message' : ''}`,
						messageClassName,
					)}
				>
					{message}
				</p>
			)}
		</div>
	);
};
