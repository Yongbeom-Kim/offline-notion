import { Card, Divider } from "@mui/joy";
import { useState } from "react";
import { useDocumentMetadataList } from "@/hooks/use-document-store";
import { DocumentListCardBody } from "./DocumentListCardBody";
import { DocumentListCardHeader } from "./DocumentListCardHeader";

export const DocumentListCard = () => {
	const [editingId, setEditingId] = useState<string | null>(null);
	const { documentList, refreshDocumentList, isLoading } =
		useDocumentMetadataList();

	return (
		<Card variant="outlined" sx={{ p: 3 }}>
			<DocumentListCardHeader
				documentList={documentList}
				isLoading={isLoading}
				refreshDocumentList={refreshDocumentList}
			/>
			<Divider sx={{ my: 2 }} />
			<DocumentListCardBody
				documentList={documentList}
				isLoading={isLoading}
				editingId={editingId}
				setEditingId={setEditingId}
			/>
		</Card>
	);
};
