import { ComponentPropsWithRef } from 'react';

import { ButtonVariantTypes } from '../button/Button';
import { ActiveLinkVariantTypes } from './Link';

/** Props type for the Link component. */
export type LinkPropsType = Omit<ComponentPropsWithRef<'a'>, 'href'> & {
	/** If true, the link will render its children as a child of the link element. */
	asChild?: boolean;

	/** Link URL. */
	href: string | { pathname: string; query?: Record<string, string | number | boolean> };

	/** Whether the link is currently on the same page as this link. */
	active?: boolean;

	/** Link variant. Default - link. */
	variant?: (typeof ButtonVariantTypes)['variant'];

	/** Link size. Default - link. */
	size?: (typeof ButtonVariantTypes)['size'];

	/** Active link variant. Default - default. */
	activeVariant?: (typeof ActiveLinkVariantTypes)['activeVariant'];

	/** Active indicator position. Default - bottom. */
	activeIndicatorPosition?: 'bottom' | 'top' | 'left' | 'right';

	/** Whether the link is disabled. */
	disabled?: boolean;
};
