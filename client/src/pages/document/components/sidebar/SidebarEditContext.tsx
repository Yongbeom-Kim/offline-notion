import { createContext, type ReactNode, useContext, useState } from "react";

type SidebarEditContextType = {
	editingNodeId: string | null;
	setEditingNodeId: (id: string | null) => void;
};

const SidebarEditContext = createContext<SidebarEditContextType | null>(null);

export const SidebarEditProvider = ({ children }: { children: ReactNode }) => {
	const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

	return (
		<SidebarEditContext.Provider value={{ editingNodeId, setEditingNodeId }}>
			{children}
		</SidebarEditContext.Provider>
	);
};

export const useSidebarEdit = () => {
	const context = useContext(SidebarEditContext);
	if (!context) {
		throw new Error("useSidebarEdit must be used within SidebarEditProvider");
	}
	return context;
};
