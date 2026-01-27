export const deepMerge = <T>(obj1: T, obj2: Partial<T> | undefined) => {
	if (!obj2) return obj1;
	// biome-ignore lint/suspicious/noExplicitAny: we check the types here.
	const isObject = (obj: any) =>
		obj && typeof obj === "object" && !Array.isArray(obj);

	// biome-ignore lint/suspicious/noExplicitAny: we check the types here.
	const merge = (target: any, source: any) => {
		const output = { ...target };
		for (const key in source) {
			if (Object.hasOwn(source, key) && source[key] !== undefined) {
				if (isObject(output[key]) && isObject(source[key])) {
					output[key] = merge(output[key], source[key]);
				} else {
					output[key] = source[key];
				}
			}
		}
		return output;
	};
	return merge(obj1, obj2);
};
