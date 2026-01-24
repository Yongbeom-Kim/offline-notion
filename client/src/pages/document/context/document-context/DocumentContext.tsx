import { useParams } from "@tanstack/react-router";
import { createContext, useContext } from "react";
import { useGetNode, type NodeMetadata } from "@/db/metadata";

type DocumentContextType = {
	metadata: {
		data: NodeMetadata | null | undefined;
		error: Error | null;
		isLoading: boolean;
	};
};

const DocumentContext = createContext<DocumentContextType>({
	metadata: {
		data: undefined,
		error: null,
		isLoading: true,
	},
});

export const DocumentContextProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const params = useParams({ strict: false });
	const documentId = (params as { docId?: string }).docId || null;

	const metadata = useGetNode(documentId);

	return (
		<DocumentContext.Provider value={{ metadata }}>
			{children}
		</DocumentContext.Provider>
	);
};

export const useDocumentContext = () => {
	return useContext(DocumentContext);
};
