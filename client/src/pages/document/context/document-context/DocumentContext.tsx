import { useParams } from "@tanstack/react-router";
import { createContext, useContext, useEffect } from "react";
import { type NodeMetadata, useGetNode } from "@/integrations/db/metadata";

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

	useEffect(() => {
		if (metadata.data?.title) {
			document.title = metadata.data.title;
		} else {
			document.title = "Offline Notion";
		}
	}, [metadata.data?.title]);

	return (
		<DocumentContext.Provider value={{ metadata }}>
			{children}
		</DocumentContext.Provider>
	);
};

export const useDocumentContext = () => {
	return useContext(DocumentContext);
};
