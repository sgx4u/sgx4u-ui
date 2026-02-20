import { JSX } from 'react';

import { LinkPropsType } from './link.type';

/** Dynamically detect if running in a Next.js environment */
let NextLink: typeof import('next/link').default | null = null;
try {
	NextLink = (await import('next/link')).default;
} catch {
	NextLink = null;
}

/**
 * @name AdoptiveLink
 * @description Dynamically detects if running in a Next.js environment and returns the appropriate link component.
 * @returns {JSX.Element} The AdoptiveLink component.
 */
export function AdoptiveLink({ ...props }: LinkPropsType): JSX.Element {
	/** If NextLink is available, use it; otherwise fallback to <a>. */
	if (NextLink) return <NextLink {...props} />;
	return <a {...props} href={props.href as string} />;
}
