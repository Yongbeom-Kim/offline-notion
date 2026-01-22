import { useLiveQuery } from "dexie-react-hooks";
import { getDocumentMetadataList } from "@/db/metadata";

export const useGetDocumentMetadataList = () => {
	const documentList = useLiveQuery(
		() => {
			return getDocumentMetadataList();
		},
		[],
		null,
	);

	return {
		documentList,
		isLoading: documentList === null,
	};
};
