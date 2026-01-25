import {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";

type SidebarState = {
	isExpanded: boolean;
	width: number;
	computeWidthOnOverflow: boolean;
};

type ContextType = {
	sidebarState: SidebarState;
	setSidebarState: React.Dispatch<React.SetStateAction<SidebarState>>;
	observeOverflowOnRef: (el: HTMLElement | null) => void; // callback ref for dynamic width
};

// @ts-expect-error we explicitly check for null in the useContext hook
export const DocumentPageLayoutContext = createContext<ContextType>(null);

export const DocumentPageLayoutContextProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [sidebarState, setSidebarState] = useState<SidebarState>({
		isExpanded: true,
		width: 200,
		computeWidthOnOverflow: true,
	});

	const observersMap = useRef<WeakMap<HTMLElement, ResizeObserver>>(
		new WeakMap(),
	);

	const observeOverflowOnRef = useCallback((el: HTMLElement | null) => {
		if (!el) return;

		// If already observing this element, skip
		if (observersMap.current.has(el)) return;

		const observer = new ResizeObserver(() => {
			if (!el.scrollWidth || !el.clientWidth) return;
			const gap = Math.max(el.scrollWidth - el.clientWidth, 0);
			if (gap === 0) return;

			setSidebarState((state) => ({
				...state,
				width: state.width + gap,
			}));
		});

		observer.observe(el);
		observersMap.current.set(el, observer);

		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<DocumentPageLayoutContext.Provider
			value={{
				sidebarState,
				setSidebarState,
				observeOverflowOnRef: observeOverflowOnRef,
			}}
		>
			{children}
		</DocumentPageLayoutContext.Provider>
	);
};

export const useDocumentPageLayoutContext = () => {
	const context = useContext(DocumentPageLayoutContext);
	if (context === null) {
		throw new Error(
			"useDocumentPageLayoutContext must be used within a DocumentPageLayoutContextProvider",
		);
	}
	return context;
};
