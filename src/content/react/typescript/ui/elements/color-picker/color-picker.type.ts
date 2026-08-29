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
	stops: Array<ColorStopType>;
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

	/** Whether to show the selection color/gradient on the trigger. Default - true. */
	showSelectionOnTrigger?: boolean;

	/** Props for the popover. */
	popoverProps?: Omit<PopoverPropsType, 'children'>;

	/** Props for the popover trigger. */
	popoverTriggerProps?: Omit<PopoverTriggerPropsType, 'disabled'>;

	/** Props for the popover content. */
	popoverContentProps?: Omit<PopoverContentPropsType, 'children'>;
};

/** Which pickers the ColorPicker exposes. */
export type ColorPickerModeType = 'solid' | 'gradient' | 'both';

/** Props when only the solid color picker is shown. */
type ColorPickerPropsSolidOnly = ColorPickerPropsBase & {
	/** Render only the solid color picker. */
	mode: 'solid';

	/** Current color value (solid only). */
	value?: SolidColorType;

	/** Callback when color changes. Only fires on mouse release when dragging. */
	onChange?: (value: SolidColorType) => void;
};

/** Props when only the gradient color picker is shown. */
type ColorPickerPropsGradientOnly = ColorPickerPropsBase & {
	/** Render only the gradient color picker. */
	mode: 'gradient';

	/** Current color value (gradient only). */
	value?: GradientColorType;

	/** Callback when color changes. Only fires on mouse release when dragging. */
	onChange?: (value: GradientColorType) => void;
};

/** Props when both solid and gradient pickers are available. */
type ColorPickerPropsBoth = ColorPickerPropsBase & {
	/** Expose both the solid and gradient pickers. Default - 'both'. */
	mode?: 'both';

	/** Current color value (solid or gradient). */
	value?: ColorType;

	/** Callback when color changes. Only fires on mouse release when dragging. */
	onChange?: (value: ColorType) => void;
};

/** Props for the ColorPicker component. Value and onChange types depend on the mode. */
export type ColorPickerPropsType = ColorPickerPropsSolidOnly | ColorPickerPropsGradientOnly | ColorPickerPropsBoth;

/** Minimal typing for the experimental browser EyeDropper API. */
export type EyeDropperConstructorType = new () => { open: () => Promise<{ sRGBHex: string }> };

/** Props for the SaturationLuminancePicker component. */
export type SaturationLuminancePickerPropsType = {
	/** Current hue (0–360). */
	hue: number;

	/** Current saturation (0–100). */
	saturation: number;

	/** Current luminance (0–100). */
	luminance: number;

	/** Callback fired with the new saturation and luminance. */
	onChange: (saturation: number, luminance: number) => void;

	/** Whether to remove the default top padding. */
	removeTopPadding?: boolean;
};

/** Props for the HueSlider component. */
export type HueSliderPropsType = {
	/** Current hue (0–360). */
	value: number;

	/** Callback fired with the new hue. */
	onChange: (value: number) => void;
};

/** Props for the AlphaSlider component. */
export type AlphaSliderPropsType = {
	/** Current alpha (0–1). */
	value: number;

	/** Base color used for the gradient and indicator. */
	color: string;

	/** Callback fired with the new alpha. */
	onChange: (value: number) => void;
};

/** Props for the ColorFormatInput component. */
export type ColorFormatInputPropsType = {
	/** Color format. */
	format: ColorFormatType;

	/** Hex color. */
	hex: string;

	/** Alpha value. */
	alpha: number;

	/** Whether to show the alpha slider. */
	showAlpha: boolean;

	/** Callback when the color format changes. */
	onFormatChange: (format: ColorFormatType) => void;

	/** Callback when the color changes. */
	onColorChange: (hex: string, alpha: number) => void;

	/** Callback when the show alpha checkbox changes. */
	onShowAlphaChange: (show: boolean) => void;

	/** Whether the eyedropper is supported. */
	eyedropperSupported?: boolean;

	/** Callback when the eyedropper is clicked. */
	onEyedropperClick?: () => void;

	/** Callback when the Select opens or closes. */
	onSelectOpenChange?: (open: boolean) => void;
};

/** Props for the GradientPreviewBar component. */
export type GradientPreviewBarPropsType = {
	/** The gradient value to preview. */
	gradientValue: GradientColorType;

	/** The currently selected stop id. */
	selectedStopId: string | null;

	/** Callback when the selected stop changes. */
	onSelectedStopChange: (stopId: string) => void;

	/** Callback when a stop is added at a position. */
	onAddStopAtPosition: (position: number) => void;

	/** Callback when a stop position changes. */
	onStopPositionChange: (stopId: string, position: number) => void;

	/** Callback when a stop is deleted. */
	onDeleteStop?: (stopId: string) => void;

	/** Additional class names. */
	className?: string;
};

/** Props for the GradientEditor component. */
export type GradientEditorPropsType = {
	/** Gradient type. */
	type: GradientType;

	/** Gradient angle. */
	angle: number;

	/** Gradient stops. */
	stops: Array<ColorStopType>;

	/** Selected stop ID. */
	selectedStopId: string | null;

	/** Callback when the selected stop changes. */
	onSelectedStopChange: (stopId: string | null) => void;

	/** Callback when the gradient type changes. */
	onTypeChange: (type: GradientType) => void;

	/** Callback when the gradient angle changes. */
	onAngleChange: (angle: number) => void;

	/** Callback when the gradient stops change. */
	onStopsChange: (stops: Array<ColorStopType>) => void;

	/** Callback when the gradient type Select opens or closes. */
	onSelectOpenChange?: (open: boolean) => void;
};
