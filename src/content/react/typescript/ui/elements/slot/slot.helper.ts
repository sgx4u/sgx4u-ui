import { CSSProperties, Ref, RefCallback } from 'react';

/** Possible ref values that can be composed together. */
type PossibleRef<T> = Ref<T> | undefined;

/**
 * @description Assigns a value to a React ref, supporting both callback refs and object refs.
 * @template T
 * @param {object} props - The props for the set ref.
 * @param {PossibleRef<T>} props.ref - The ref to assign.
 * @param {T} props.value - The value to assign to the ref.
 * @returns {void}
 */
function setRef<T>({ ref, value }: { ref: PossibleRef<T>; value: T }): void {
	if (typeof ref === 'function') {
		ref(value);
		return;
	}

	if (ref !== null && ref !== undefined) ref.current = value;
}

/**
 * @description Composes multiple refs into a single callback ref so both the slot and the child keep their refs.
 * @template T
 * @param {Array<PossibleRef<T>>} refs - The refs to compose.
 * @returns {RefCallback<T>} A callback ref that forwards the node to every provided ref.
 */
export function composeRefs<T>(...refs: Array<PossibleRef<T>>): RefCallback<T> {
	return (node: T): void => {
		for (const ref of refs) {
			setRef({ ref, value: node });
		}
	};
}

/**
 * @description Concatenates aria-describedby id tokens from the child and the slot without duplicates.
 * @param {Array<unknown>} values - The aria-describedby values to concatenate.
 * @returns {string | undefined} A space-separated id list, or undefined when empty.
 */
function concatenateAriaDescribedBy(...values: Array<unknown>): string | undefined {
	const identifiers = new Set<string>();

	for (const value of values) {
		if (typeof value !== 'string') continue;

		for (const identifier of value.trim().split(/\s+/)) {
			if (identifier) identifiers.add(identifier);
		}
	}

	return identifiers.size > 0 ? Array.from(identifiers).join(' ') : undefined;
}

/**
 * @description Merges slot props onto child props. Child props win on conflicts; event handlers are composed (child first); style, className, and aria-describedby are merged.
 * @param {object} props - The props for the merge.
 * @param {Record<string, unknown>} props.slotProps - Props provided by the Slot parent.
 * @param {Record<string, unknown>} props.childProps - Props already present on the child element.
 * @returns {Record<string, unknown>} The merged props object.
 */
export function mergeProps({
	slotProps,
	childProps,
}: {
	slotProps: Record<string, unknown>;
	childProps: Record<string, unknown>;
}): Record<string, unknown> {
	const overrideProps: Record<string, unknown> = { ...childProps };

	for (const propName in childProps) {
		const slotPropValue = slotProps[propName];
		const childPropValue = childProps[propName];
		const isHandler = /^on[A-Z]/.test(propName);

		if (isHandler) {
			if (slotPropValue && childPropValue) {
				overrideProps[propName] = (...argumentsList: Array<unknown>): unknown => {
					const childResult =
						typeof childPropValue === 'function' ? childPropValue(...argumentsList) : undefined;

					if (typeof slotPropValue === 'function') slotPropValue(...argumentsList);

					return childResult;
				};
			} else if (slotPropValue) {
				overrideProps[propName] = slotPropValue;
			}
		} else if (propName === 'style') {
			overrideProps[propName] = {
				...(typeof slotPropValue === 'object' && slotPropValue !== null
					? (slotPropValue as CSSProperties)
					: null),
				...(typeof childPropValue === 'object' && childPropValue !== null
					? (childPropValue as CSSProperties)
					: null),
			};
		} else if (propName === 'className') {
			overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(' ');
		} else if (propName === 'aria-describedby') {
			overrideProps[propName] = concatenateAriaDescribedBy(childPropValue, slotPropValue);
		}
	}

	return { ...slotProps, ...overrideProps };
}
