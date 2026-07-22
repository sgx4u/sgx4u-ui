import { ContainerPropsType } from '../container';

/** Props type for the VisuallyHidden component. */
export type VisuallyHiddenPropsType = Omit<ContainerPropsType, 'as'> & {
	/** Reveal the content when it or a descendant receives keyboard focus, e.g. skip links. Default - false. */
	focusable?: boolean;

	/** HTML element to render as. Default - span. */
	as?: ContainerPropsType['as'];
};
