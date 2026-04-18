import { ToastOptionsType, ToastPromiseOptionsType } from './toast.type';

import { addToast, updateToast } from './toast.store';

/** Imperative toast API. */
export const toast = {
	success: (options: ToastOptionsType): string => addToast(options, 'success'),
	error: (options: ToastOptionsType): string => addToast(options, 'error'),
	warn: (options: ToastOptionsType): string => addToast(options, 'warn'),
	info: (options: ToastOptionsType): string => addToast(options, 'info'),
	default: (options: ToastOptionsType): string => addToast(options, 'default'),
	promise: <T>(promise: Promise<T>, options: ToastPromiseOptionsType): string => {
		const { loading, success, error, ...rest } = options;
		const id = addToast({ ...rest, title: loading }, 'promise', { promiseStatus: 'pending' });

		promise
			.then((result) => {
				const title = typeof success === 'function' ? success(result) : success;
				updateToast(id, {
					title,
					variant: 'success',
					promiseStatus: 'fulfilled',
					duration: rest.duration ?? 2000,
				});
			})
			.catch((err) => {
				const title = typeof error === 'function' ? error(err) : error;
				updateToast(id, {
					title,
					variant: 'error',
					promiseStatus: 'rejected',
					duration: rest.duration ?? 2000,
				});
			});

		return id;
	},
};
