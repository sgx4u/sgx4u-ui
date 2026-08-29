import { ButtonPropsType } from '../../elements/button';

/** Button copy module props type. */
export type ButtonCopyModulePropsType = ButtonPropsType & {
	/** The value to copy to the clipboard. */
	valueToCopy?: string;

	/** Class name for the status icons. */
	iconClassName?: string;
};

/** Button download module props type. */
export type ButtonDownloadModulePropsType = ButtonPropsType & {
	/** Whether the button is currently downloading. */
	isDownloading?: boolean;

	/** Class name for the status icons. */
	iconClassName?: string;
};
