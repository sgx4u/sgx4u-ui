import { ClassValueType } from '../types/styles.type';
import { cn } from './styles.util';

/** Helper type to extract default values type from variants. */
type DefaultFromVariants<TVariants extends Record<string, Record<string, string>>> = {
	[K in keyof TVariants]?: Extract<keyof TVariants[K], string>;
};

/** Map of variant names to their allowed option keys. */
type VariantValues<TVariants extends Record<string, Record<string, string>>> = {
	[K in keyof TVariants]: Extract<keyof TVariants[K], string>;
};

/** Props accepted by the generated variant function. */
export type VariantProps<TVariants extends Record<string, Record<string, string>>> = Partial<VariantValues<TVariants>>;

/** Conditional rule type for variants. */
type VariantConditional<TVariants extends Record<string, Record<string, string>>> = {
	/** Condition to check (e.g., { variant: 'default' }). */
	when: Partial<{
		[K in keyof TVariants]: VariantValues<TVariants>[K] | Array<VariantValues<TVariants>[K]>;
	}>;

	/** Classes to apply when condition is met. */
	apply: string;
};

/** Variant configuration type shared by makeVariants input and output. */
export type VariantConfig<TVariants extends Record<string, Record<string, string>>> = {
	/** Base classes that are always applied. */
	base?: string;

	/** Variant configurations. */
	variants: TVariants;

	/** Default variant values. Keys must exist in variants, values must be keys of the corresponding variant. */
	default?: DefaultFromVariants<TVariants>;

	/** Skip base classes when the provided variant value matches one of these entries. */
	skipBaseClasses?: Array<VariantValues<TVariants>[keyof TVariants]>;

	/** Conditional rules. */
	conditionals?: Array<VariantConditional<TVariants>>;
};

/** Variant function return type. */
type VariantFunction<TVariants extends Record<string, Record<string, string>>> = (
	props?: VariantProps<TVariants>,
) => string;

/** CVA return type with types. */
type MakeVariantsReturnType<TVariants extends Record<string, Record<string, string>>> = {
	variants: VariantFunction<TVariants>;
	types: { [K in keyof TVariants]: keyof TVariants[K] };
	config: VariantConfig<TVariants>;
};

/**
 * @description Variant utility function. This function replaces the functionality of the class-variance-authority package.
 * @template TVariants
 * @param {VariantConfig<TVariants>} config - The configuration for the variants.
 * @param {string} config.base - The base classes to apply.
 * @param {Record<string, Record<string, string>>} config.variants - The variants to generate.
 * @param {Record<string, string>} config.default - The default variants to apply.
 * @param {Array<string>} config.skipBaseClasses - The variants to skip the base classes.
 * @param {Array<{ when: Record<string, string>; apply: string }>} config.conditionals - The conditional rules to apply.
 * @returns {MakeVariantsReturnType<TVariants>} The variants function and types.
 */
export function makeVariants<const TVariants extends Record<string, Record<string, string>>>(
	config: VariantConfig<TVariants>,
): MakeVariantsReturnType<TVariants> {
	const variants: VariantFunction<TVariants> = function variants(props = {} as VariantProps<TVariants>): string {
		const classes: Array<ClassValueType> = [];

		/**
		 * Filter out undefined values from props so that defaults apply for those keys.
		 * Then merge defaults with the defined props to produce the complete variant state.
		 */
		const definedProps = Object.fromEntries(
			Object.entries(props).filter(([, value]) => value !== undefined),
		) as VariantProps<TVariants>;

		const completeProps: VariantProps<TVariants> = { ...config.default, ...definedProps };

		/** Check if any explicitly provided variant value is in skipBaseClasses. */
		let shouldSkipBase = false;

		if (config.skipBaseClasses && config.skipBaseClasses.length > 0) {
			const definedValues = Object.values(definedProps) as Array<VariantValues<TVariants>[keyof TVariants]>;

			for (const skipValue of config.skipBaseClasses) {
				if (definedValues.includes(skipValue)) {
					shouldSkipBase = true;
					break;
				}
			}
		}

		/** Add base classes if not skipped. */
		if (config.base && !shouldSkipBase) {
			classes.push(config.base);
		}

		/** Process variants using the merged state (defaults + defined props). */
		for (const variantName in config.variants) {
			const variantOptions = config.variants[variantName];
			const variantValue = completeProps[variantName];

			if (variantValue !== undefined) {
				const variantClassName = variantOptions[variantValue];

				if (variantClassName) {
					classes.push(variantClassName);
				} else if (config.default?.[variantName]) {
					/** Provided value is invalid; fall back to the default class. */
					const defaultValue = config.default[variantName]!;
					const defaultClassName = variantOptions[defaultValue];
					if (defaultClassName) classes.push(defaultClassName);
				}
			}
		}

		/** Apply conditional classes based on the effective variant state. */
		if (config.conditionals && config.conditionals.length > 0) {
			for (const conditional of config.conditionals) {
				if (matchesCondition(conditional.when, completeProps)) {
					classes.push(conditional.apply);
				}
			}
		}

		return cn(...classes);
	};

	return { variants, types: {} as { [K in keyof TVariants]: keyof TVariants[K] }, config };
}

/**
 * @description Check if a condition matches the current props.
 * @param {VariantConditional<TVariants>['when']} condition - The condition to check.
 * @param {VariantProps<TVariants>} props - The props to check.
 * @returns {boolean} True if the condition matches, false otherwise.
 */
function matchesCondition<TVariants extends Record<string, Record<string, string>>>(
	condition: VariantConditional<TVariants>['when'],
	props: VariantProps<TVariants>,
): boolean {
	for (const [key, expectedValue] of Object.entries(condition) as Array<
		[keyof TVariants, VariantValues<TVariants>[keyof TVariants] | Array<VariantValues<TVariants>[keyof TVariants]>]
	>) {
		const actualValue = props[key];

		if (Array.isArray(expectedValue)) {
			/** If expectedValue is an array, check if actualValue is in the array. */
			if (!expectedValue.includes(actualValue as VariantValues<TVariants>[keyof TVariants])) return false;
		} else {
			if (actualValue !== expectedValue) return false;
		}
	}

	return true;
}
