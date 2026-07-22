import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @description Merge className using tailwind-merge and clsx.
 * @param {Array<ClassValue>} inputs - Class values to merge.
 * @returns {string} The merged class name.
 */
export function cn(...inputs: Array<ClassValue>): string {
	return twMerge(clsx(inputs));
}
