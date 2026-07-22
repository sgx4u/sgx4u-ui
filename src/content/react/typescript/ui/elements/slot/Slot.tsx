'use client';

import { cloneElement, Fragment, isValidElement, JSX, Ref } from 'react';

import { SlotPropsType } from './slot.type';
import { composeRefs, mergeProps } from './slot.helper';

/**
 * @description Merges its props onto a single child element without creating an extra DOM node.
 * @returns {JSX.Element | null} The cloned child with merged props, or null when there is no child.
 */
export function Slot({ children, ref: forwardedRef, ...slotProps }: SlotPropsType): JSX.Element | null {
	if (!isValidElement(children)) {
		if (children == null || children === false) return null;
		throw new Error('Slot expects a single React element child.');
	}

	const childProps = children.props as Record<string, unknown>;
	const childRef = childProps['ref'] as Ref<HTMLElement> | undefined;
	const mergedProps = mergeProps({ slotProps: slotProps as Record<string, unknown>, childProps });

	if (children.type !== Fragment) {
		mergedProps['ref'] = forwardedRef ? composeRefs(forwardedRef, childRef) : childRef;
	}

	return cloneElement(children, mergedProps);
}
