import { ToastOptionsType, ToastPromiseOptionsType, ToastUpdateOptionsType } from './toast.type';

import { addToast, DEFAULT_DURATION, requestDismiss, updateToast } from './toast.store';

/** Imperative toast API. */
export const toast = {
	success: (options: ToastOptionsType): string => addToast(options, 'success'),
	danger: (options: ToastOptionsType): string => addToast(options, 'danger'),
	warn: (options: ToastOptionsType): string => addToast(options, 'warn'),
	info: (options: ToastOptionsType): string => addToast(options, 'info'),
	default: (options: ToastOptionsType): string => addToast(options, 'default'),
	loading: (options: ToastOptionsType): string => addToast(options, 'promise', { promiseStatus: 'pending' }),
	update: (id: string, options: ToastUpdateOptionsType): void => {
		/** Resolving a loading toast to a final variant should auto-dismiss unless a duration is given. */
		const shouldAutoDismiss = options.variant !== undefined && options.variant !== 'promise';
		const duration = options.duration ?? (shouldAutoDismiss ? DEFAULT_DURATION : undefined);
		updateToast(id, duration === undefined ? options : { ...options, duration });
	},
	dismiss: (id: string): void => requestDismiss(id),
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
					duration: rest.duration ?? DEFAULT_DURATION,
				});
			})
			.catch((rejectionReason) => {
				const title = typeof error === 'function' ? error(rejectionReason) : error;
				updateToast(id, {
					title,
					variant: 'danger',
					promiseStatus: 'rejected',
					duration: rest.duration ?? DEFAULT_DURATION,
				});
			});

		return id;
	},
};
