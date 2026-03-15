/** Toast variant type. */
export type ToastVariant = 'default' | 'success' | 'warn' | 'error' | 'info' | 'promise';

/** Promise toast status (loading → fulfilled or rejected). */
export type ToastPromiseStatus = 'pending' | 'fulfilled' | 'rejected';

/** Toast position type. */
export type ToastPosition =
	| 'top-right'
	| 'top-left'
	| 'top-center'
	| 'bottom-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'center';

/** Toast item in the store. */
export type ToastItemType = {
	/** Unique identifier for the toast. */
	id: string;

	/** Title or main message. */
	title: string;

	/** Optional description shown below the title. */
	description?: string;

	/** Visual variant. */
	variant: ToastVariant;

	/** Promise status (only when variant is 'promise'). */
	promiseStatus?: ToastPromiseStatus;

	/** Position on screen. */
	position: ToastPosition;

	/** Whether to show a close button. */
	dismissible: boolean;

	/** Duration in milliseconds. */
	duration?: number;

	/** Timestamp when the toast was created. */
	createdAt: number;
};

/** Options for adding a toast. */
export type ToastOptionsType = {
	/** Title or main message. */
	title: string;

	/** Optional description shown below the title. */
	description?: string;

	/** Position on screen. Default - top-right. */
	position?: ToastPosition;

	/** Whether to show a close button. Default - true. */
	dismissible?: boolean;

	/** Duration in milliseconds. Default - 2000. */
	duration?: number;
};

/** Default options for all toasts (passed to Toaster). */
export type ToastDefaultOptionsType = Partial<
	Pick<ToastOptionsType, 'position' | 'dismissible' | 'duration'>
>;

/** Options for promise toast. */
export type ToastPromiseOptionsType = ToastOptionsType & {
	/** Message shown while promise is pending. */
	loading: string;

	/** Message shown when promise fulfills. Can be a function receiving the result. */
	success: string | ((result: unknown) => string);

	/** Message shown when promise rejects. Can be a function receiving the error. */
	error: string | ((error: unknown) => string);
};
