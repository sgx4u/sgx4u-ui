'use client';

import { JSX, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { PortalPropsType } from './portal.type';

/** Layout effect on the client, no-op on the server. Mounts before paint (avoiding animation races) without triggering the SSR useLayoutEffect warning. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * @description Mechanism for rendering content into a different part of the DOM tree, often used for overlays and dialogs.
 * @returns {JSX.Element} The Portal component.
 */
export function Portal({ container, children }: PortalPropsType): JSX.Element {
	/** Defer rendering until after mount so the server and client output match during hydration. */
	const [isMounted, setIsMounted] = useState(false);

	/** Mount before the next paint so overlays paint their closed state first, letting enter transitions run reliably. */
	useIsomorphicLayoutEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return <></>;
	return createPortal(children, container ?? document.body);
}
