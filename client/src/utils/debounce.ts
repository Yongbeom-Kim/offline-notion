export type Debounced<T extends (...args: unknown[]) => void> = {
	(this: ThisParameterType<T>, ...args: Parameters<T>): void;
	cancel(): void;
};

export function debounce<T extends (...args: unknown[]) => void>(
	fn: T,
	delay: number,
): Debounced<T> {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	const debouncedFn = function (
		this: ThisParameterType<T>,
		...args: Parameters<T>
	) {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			fn.apply(this, args);
			timeoutId = null;
		}, delay);
	};
	debouncedFn.cancel = () => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}
		timeoutId = null;
	};
	return debouncedFn;
}
