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

export function debounceWithForcedExecution<
	T extends (...args: unknown[]) => void,
>(
	fn: T,
	delay: number,
	maxWait: number, // clearer name
): Debounced<T> {
	let forcedExecuteTimeout: ReturnType<typeof setTimeout> | null = null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let latestArgs: Parameters<T>;
	let latestThis: ThisParameterType<T>;

	const debouncedFn = function (
		this: ThisParameterType<T>,
		...args: Parameters<T>
	) {
		latestArgs = args;
		latestThis = this;

		if (forcedExecuteTimeout === null) {
			forcedExecuteTimeout = setTimeout(() => {
				fn.apply(latestThis, latestArgs);
				forcedExecuteTimeout = null;
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = null;
				}
			}, maxWait);
		}

		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			fn.apply(latestThis, latestArgs);
			timeoutId = null;
			if (forcedExecuteTimeout) {
				clearTimeout(forcedExecuteTimeout);
				forcedExecuteTimeout = null;
			}
		}, delay);
	};

	debouncedFn.cancel = () => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}
		timeoutId = null;
		if (forcedExecuteTimeout !== null) {
			clearTimeout(forcedExecuteTimeout);
		}
		forcedExecuteTimeout = null;
	};

	return debouncedFn;
}
