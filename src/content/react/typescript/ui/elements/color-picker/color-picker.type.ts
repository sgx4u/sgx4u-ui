import { PopoverContentPropsType, PopoverPropsType, PopoverTriggerPropsType } from '../popover/popover.type';

/** Supported color format for manual input. */
export type ColorFormatType = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk';

/** Gradient type for CSS. */
export type GradientType = 'linear' | 'radial' | 'conic';

/** RGB color representation (0–255). */
export type RGB = { red: number; green: number; blue: number };

/** HSL color representation (hue 0–360, saturation/lightness 0–100). */
export type HSL = { hue: number; saturation: number; lightness: number };

/** HSV color representation (hue 0–360, saturation/value 0–100). */
export type HSV = { hue: number; saturation: number; value: number };

/** CMYK color representation (0–100). */
export type CMYK = { cyan: number; magenta: number; yellow: number; black: number };

/** Solid color return type with all format representations. */
export type SolidColorType = {
	mode: 'solid';
	hex: string;
	rgb: RGB;
	hsl: HSL;
	hsv: HSV;
	cmyk: CMYK;
	string: string;
	alpha: number;
};

/** A single color stop in a gradient. */
export type ColorStopType = Omit<SolidColorType, 'mode'> & {
	id: string;
	position: number;
};

/** Gradient color type with full stop representations. */
export type GradientColorType = {
	mode: 'gradient';
	type: GradientType;
	angle: number;
	stops: ColorStopType[];
	string: string;
};

/** Union of color return types. */
export type ColorType = SolidColorType | GradientColorType;

/** Base props shared by all ColorPicker variants. */
type ColorPickerPropsBase = {
	/** Default value when uncontrolled (value and onChange not passed). Accepts hex, rgb, rgba, hsl, hsla, or gradient CSS. */
	defaultValue?: string;

	/** Whether the picker is disabled. */
	disabled?: boolean;

	/** Whether to show the selection color/gradient on the trigger. Default true. */
	showSelectionOnTrigger?: boolean;

	/** When set, syncs the picker to this color string. Accepts hex, rgb, rgba, hsl, hsla, or gradient CSS. */
	syncColor?: string;

	/** Props for the popover. */
	popoverProps?: Omit<PopoverPropsType, 'children'>;

	/** Props for the popover trigger. */
	popoverTriggerProps?: Omit<PopoverTriggerPropsType, 'disabled'>;

	/** Props for the popover content. */
	popoverContentProps?: Omit<PopoverContentPropsType, 'children'>;
};

/** Props when only solid color picker is shown. */
type ColorPickerPropsSolidOnly = ColorPickerPropsBase & {
	onlySolidColorPicker: true;
	onlyGradientColorPicker?: false;

	/** Current color value (solid only). */
	value?: SolidColorType;

	/** Callback when color changes. Only fires on mouse release when dragging. */
	onChange?: (value: SolidColorType) => void;
};

/** Props when only gradient color picker is shown. */
type ColorPickerPropsGradientOnly = ColorPickerPropsBase & {
	onlySolidColorPicker?: false;
	onlyGradientColorPicker: true;

	/** Current color value (gradient only). */
	value?: GradientColorType;

	/** Callback when color changes. Only fires on mouse release when dragging. */
	onChange?: (value: GradientColorType) => void;
};

/** Props when both solid and gradient pickers are available. */
type ColorPickerPropsBoth = ColorPickerPropsBase & {
	onlySolidColorPicker?: false;
	onlyGradientColorPicker?: false;

	/** Current color value (solid or gradient). */
	value?: ColorType;

	/** Callback when color changes. Only fires on mouse release when dragging. */
	onChange?: (value: ColorType) => void;
};

/** Props for the ColorPicker component. Value and onChange types depend on onlySolidColorPicker and onlyGradientColorPicker. */
export type ColorPickerPropsType = ColorPickerPropsSolidOnly | ColorPickerPropsGradientOnly | ColorPickerPropsBoth;
