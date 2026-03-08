'use client';

import { JSX, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { PortalPropsType } from './portal.type';

/**
 * @description Mechanism for rendering content into a different part of the DOM tree, often used for overlays and dialogs.
 * @returns {JSX.Element} The Portal component.
 */
export function Portal({ container, children }: PortalPropsType): JSX.Element {
	const [mountNode, setMountNode] = useState<Element | null>(null);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMountNode(container ?? document.body);
	}, [container]);

	if (!mountNode) return <></>;
	return createPortal(children, mountNode);
}
