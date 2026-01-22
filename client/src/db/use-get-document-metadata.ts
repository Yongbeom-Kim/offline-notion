import { useLiveQuery } from "dexie-react-hooks";
import { useRef } from "react";
import {
	type DexieDocumentDB,
	getDocumentMetadata,
	getDocumentMetadataDb,
} from "@/db/metadata";

export const useGetDocumentMetadata = (id: string | null | undefined) => {
	const dexieDbRef = useRef<DexieDocumentDB | null>(getDocumentMetadataDb());

	const [data, errorMsg, isLoading] = useLiveQuery(
		() => {
			if (typeof window === "undefined")
				return [null, "SSR Environment", false];
			if (!dexieDbRef.current) return [null, "Failed to initialize DB", false];
			if (!id) return [null, "Document ID is null or undefined", false];
			return getDocumentMetadata(id).then(
				(value) => [value, null, false],
				(err) => [null, err, false],
			);
		},
		[id],
		[null, null, true],
	);

	return {
		data,
		error: errorMsg !== null ? new Error(errorMsg) : null,
		isLoading,
	};
};
