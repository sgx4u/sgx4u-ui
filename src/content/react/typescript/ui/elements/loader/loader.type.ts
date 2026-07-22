import { ComponentPropsWithRef } from 'react';

import { ContainerPropsType } from '../container';

/** Props type for the Loader component. */
export type LoaderPropsType = ComponentPropsWithRef<'svg'> & {
	/** Props to be passed to the container. */
	containerProps?: Omit<ContainerPropsType, 'as'> & {
		/** HTML element to render as. Default - span. */
		as?: ContainerPropsType['as'];
	};
};
