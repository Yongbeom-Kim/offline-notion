import { createContext, useContext, useState } from "react";

type SidebarState = {
	isExpanded: boolean;
	width: number;
	computeWidthOnMount: boolean;
};

type ContextType = {
	sidebarState: SidebarState;
	setSidebarState: React.Dispatch<React.SetStateAction<SidebarState>>;
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
		computeWidthOnMount: true,
	});

	return (
		<DocumentPageLayoutContext.Provider
			value={{
				sidebarState,
				setSidebarState,
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
