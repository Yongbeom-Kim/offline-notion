import { useQuery } from "@tanstack/react-query";
import { useGetDocumentMetadataList } from "@/db/use-get-document-metadata-list";
import { buildDocumentHierarchy } from "@/pages/document/utils/document-hierarchy";

/**
 * Hook to compute and provide document hierarchy based on internal links
 * @returns Object containing hierarchy data and loading state
 */
export function useDocumentHierarchy() {
	const { documentList, isLoading: isLoadingList } =
		useGetDocumentMetadataList();
	const hierarchyQuery = useQuery({
		queryKey: ["GET_DOCUMENT_HIERARCHY"],
		queryFn: () =>
			buildDocumentHierarchy(
				documentList,
				typeof window !== "undefined" ? window.location.origin : "",
			),
		enabled: !isLoadingList && documentList?.length > 0,
	});

	const refresh = () => {
		hierarchyQuery.refetch();
	};

	return {
		hierarchy: hierarchyQuery.data,
		isLoading: isLoadingList || hierarchyQuery.isLoading,
		error: hierarchyQuery.error,
		refresh,
	};
}
