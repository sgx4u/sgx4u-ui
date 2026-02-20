/**
 * @description Validate a component name.
 * @param {string} name - The name to validate.
 * @returns {boolean} True if the name is valid, false otherwise.
 */
export function validateComponentName(name: string): boolean {
	/** Check if name is a string. */
	if (!name || name.trim().length < 1 || typeof name !== 'string') return false;

	/** Check for valid characters (alphanumeric, hyphens, underscores, dots). */
	if (!/^[a-zA-Z0-9-_.]+$/.test(name)) return false;

	return true;
}

/**
 * @description Validate a directory.
 * @param {string} directory - The directory to validate.
 * @returns {boolean} True if the directory is valid, false otherwise.
 */
export function validateDirectory(directory: string): boolean {
	/** Check if directory is a string. */
	if (!directory || directory.trim().length < 1 || typeof directory !== 'string') return false;

	/** Check for parent directory references. */
	if (directory.includes('..')) return false;

	/** Check for invalid path separators. */
	if (directory.includes('\\') || directory.includes('//')) return false;

	return true;
}
