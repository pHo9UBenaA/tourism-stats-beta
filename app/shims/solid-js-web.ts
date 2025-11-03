/**
 * @file Shim for `solid-js/web` to provide missing exports for older Solid versions.
 */
export * from "solid-js/web/dist/server.js";

/**
 * Ensure compatibility with dependencies expecting `setStyleProperty`.
 */
export const setStyleProperty = (
	element: Element & { style?: CSSStyleDeclaration | undefined },
	key: string,
	value: string,
) => {
	if (element?.style?.setProperty) {
		element.style.setProperty(key, value);
	}
};
