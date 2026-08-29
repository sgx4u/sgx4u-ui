/**
 * @description Derives up to two initials from a display name for avatar fallbacks.
 * @param {string} value - The display name to derive initials from.
 * @returns {string} Uppercased initials, or an empty string when the value is blank.
 */
export function getAvatarInitials(value: string): string {
	const parts = value.trim().split(/\s+/).filter(Boolean);

	if (parts.length === 0) return '';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
