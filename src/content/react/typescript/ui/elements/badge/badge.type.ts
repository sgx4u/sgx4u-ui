import { ContainerPropsType } from '../container';
import { BadgeVariantTypes } from './Badge';

/** Props type for the Badge component. */
export type BadgePropsType = Omit<ContainerPropsType, 'as'> & {
	/** Indicates if badge represents a status (e.g., "online", "error"). */
	status?: boolean;

	/** Visual style of the badge. Default - primary. */
	variant?: (typeof BadgeVariantTypes)['variant'];

	/** Size of the badge. Default - default. */
	size?: (typeof BadgeVariantTypes)['size'];

	/** Radius of the badge. Default - full. */
	radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';

	/** HTML element to render as. Default - span. */
	as?: ContainerPropsType['as'];
};
