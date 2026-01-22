import { useParams } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";
import type { DocumentMetadata } from "@/db/metadata";
import { useGetDocumentMetadata } from "@/db/use-get-document-metadata";
import { useGetDocumentMetadataList } from "@/db/use-get-document-metadata-list";
import {
	buildDocumentHierarchy,
	type HierarchyData,
} from "../../utils/document-hierarchy";

type DocumentContextType = {
	metadata: {
		data: DocumentMetadata | null | undefined;
		error: Error | null;
		isLoading: boolean;
	};
	documentList: DocumentMetadata[] | null | undefined;
	hierarchyData: HierarchyData | undefined;
};

const DocumentContext = createContext<DocumentContextType>({
	metadata: {
		data: undefined,
		error: null,
		isLoading: true,
	},
	documentList: undefined,
	hierarchyData: undefined,
});

export const DocumentContextProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const params = useParams({ strict: false });
	const origin = typeof window !== "undefined" ? window.location.origin : "";
	const documentId = (params as { docId?: string }).docId || null;

	const metadata = useGetDocumentMetadata(documentId);
	const { documentList } = useGetDocumentMetadataList();
	const [hierarchyData, setHierarchyData] = useState<HierarchyData | undefined>(
		undefined,
	);

	useEffect(() => {
		const buildHierarchy = async () => {
			if (!documentList) return;
			setHierarchyData(await buildDocumentHierarchy(documentList, origin));
		};
		buildHierarchy();
	}, [documentList, origin]);

	return (
		<DocumentContext.Provider
			value={{
				metadata,
				documentList,
				hierarchyData,
			}}
		>
			{children}
		</DocumentContext.Provider>
	);
};

export const useDocumentContext = () => {
	return useContext(DocumentContext);
};
