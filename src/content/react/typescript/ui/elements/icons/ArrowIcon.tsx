import { JSX } from 'react';
import { ArrowBigUpIcon, ArrowUpIcon, ChevronsUpIcon, ChevronUpIcon, MoveUpIcon } from 'lucide-react';

import { ArrowIconPropsType } from './icons.type';

/** The "up" icon for each arrow style; every other direction is rendered by rotating this single icon. */
const arrowStyleIcons = {
	chevron: ChevronUpIcon,
	chevrons: ChevronsUpIcon,
	arrow: ArrowUpIcon,
	'arrow-big': ArrowBigUpIcon,
	move: MoveUpIcon,
} as const;

/** Clockwise rotation, in degrees, applied to the style's "up" icon to render each direction. */
const directionRotations = {
	up: 0,
	'up-right': 45,
	right: 90,
	'down-right': 135,
	down: 180,
	'down-left': 225,
	left: 270,
	'up-left': 315,
} as const;

/**
 * @description Renders a directional icon, letting the caller pick both the visual style (chevron, chevrons, arrow, arrow-big, move) and the direction it points in, including the four corners. Every direction is rendered by rotating the style's single "up" icon.
 * @returns {JSX.Element} The ArrowIcon component.
 */
export function ArrowIcon({ arrowStyle = 'arrow', direction, style, ...props }: ArrowIconPropsType): JSX.Element {
	const StyleIcon = arrowStyleIcons[arrowStyle];
	const rotation = directionRotations[direction];

	return <StyleIcon {...props} style={rotation === 0 ? style : { transform: `rotate(${rotation}deg)`, ...style }} />;
}
