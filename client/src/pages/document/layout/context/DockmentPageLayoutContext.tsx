import { createContext, useCallback, useContext, useState } from "react";

const STORAGE_KEY = "document-page-layout";

type SidebarState = {
	isExpanded: boolean;
	width: number;
	computeWidthOnMount: boolean;
};

type ContextType = {
	sidebarState: SidebarState;
	setSidebarState: React.Dispatch<React.SetStateAction<SidebarState>>;
	saveSidebarState: (state: SidebarState) => void;
};

const loadSidebarStateFromStorage = (): SidebarState | null => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored) as SidebarState;
		}
	} catch {
		// Ignore parse errors
	}
	return null;
};

const saveSidebarStateToStorage = (state: SidebarState) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Ignore storage errors
	}
};

const getInitialSidebarState = (): SidebarState => {
	const stored = loadSidebarStateFromStorage();
	if (stored) {
		return stored;
	}
	return {
		isExpanded: true,
		width: 200,
		computeWidthOnMount: true,
	};
};

// @ts-expect-error we explicitly check for null in the useContext hook
export const DocumentPageLayoutContext = createContext<ContextType>(null);

export const DocumentPageLayoutContextProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [sidebarState, setSidebarState] = useState<SidebarState>(
		getInitialSidebarState,
	);

	const saveSidebarState = useCallback((state: SidebarState) => {
		saveSidebarStateToStorage(state);
	}, []);

	return (
		<DocumentPageLayoutContext.Provider
			value={{
				sidebarState,
				setSidebarState,
				saveSidebarState,
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
