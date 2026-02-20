import { ComponentPropsWithRef, ElementType } from 'react';

/** Container variants. */
export type ContainerVariant = 'article' | 'aside' | 'div' | 'footer' | 'header' | 'main' | 'nav' | 'section' | 'span';

/** Props type for the Container component. */
export type ContainerPropsType<E extends ElementType = 'div'> = {
	/** If true, the container will render its children as a child of the container element. */
	asChild?: boolean;

	/** Container variant. Default - div. */
	as?: ContainerVariant;

	/** Radius of the container. Default - none. */
	radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
} & Omit<ComponentPropsWithRef<E>, 'as' | 'children'> & {
		/** Container children. */
		children?: ComponentPropsWithRef<E>['children'];
	};
