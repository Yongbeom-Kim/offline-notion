import { Box } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { getDocumentMetadata } from "@/hooks/use-document-store";
import { DocumentEditorCard } from "./components/DocumentEditorCard";
import { DocumentNotFoundCard } from "./components/DocumentNotFoundCard";
import { DocumentTitle } from "./components/DocumentTitle";

type DocumentPageProps = {
	docId: string;
};

export const DocumentPage = ({ docId }: DocumentPageProps) => {
	const { isLoading, data: document } = useQuery({
		queryKey: ["document_fetch", docId],
		queryFn: () => getDocumentMetadata(docId),
	});
	const isMissing = !isLoading && !document;

	if (isMissing) {
		return (
			<Box sx={{ px: { xs: 3, md: 6 }, py: 6 }}>
				<DocumentNotFoundCard />
			</Box>
		);
	}

	return (
		<Box sx={{ height: "100vh", width: "100vw", p: 4 }}>
			<DocumentTitle document={document ?? null} isLoading={isLoading} />
			<DocumentEditorCard documentId={document?.id ?? null} />
		</Box>
	);
};
