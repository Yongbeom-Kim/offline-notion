import { useEffect, useState } from "react";

type UseMediaQueryProps = {
	query: string;
	ssrFallbackResult: boolean;
};

export const useMediaQuery = ({
	query,
	ssrFallbackResult: ssrFallback,
}: UseMediaQueryProps) => {
	const [result, setResult] = useState(ssrFallback);

	useEffect(() => {
		const mediaQueryList = window.matchMedia(query);
		setResult(mediaQueryList.matches);

		const onChange = (ev: MediaQueryListEvent) => {
			setResult(ev.matches);
		};

		mediaQueryList.addEventListener("change", onChange);

		return () => {
			mediaQueryList.removeEventListener("change", onChange);
		};
	}, [query]);

	return result;
};
