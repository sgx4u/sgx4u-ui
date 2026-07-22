'use client';

import { JSX, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { PortalPropsType } from './portal.type';

/**
 * @description Mechanism for rendering content into a different part of the DOM tree, often used for overlays and dialogs.
 * @returns {JSX.Element} The Portal component.
 */
export function Portal({ container, children }: PortalPropsType): JSX.Element {
	/** Defer rendering until after mount so the server and client output match during hydration. */
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsMounted(true);
	}, []);

	if (!isMounted) return <></>;
	return createPortal(children, container ?? document.body);
}
