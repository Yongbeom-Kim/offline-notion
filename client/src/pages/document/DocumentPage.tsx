import { Box, Stack } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { useDocumentStore } from "@/hooks/use-document-store";
import { DocumentDetailsCard } from "./components/DocumentDetailsCard";
import { DocumentEditorCard } from "./components/DocumentEditorCard";
import { DocumentHeader } from "./components/DocumentHeader";
import { DocumentNotFoundCard } from "./components/DocumentNotFoundCard";

type DocumentPageProps = {
	docId: string;
};

export const DocumentPage = ({ docId }: DocumentPageProps) => {
	const { getDocument } = useDocumentStore();

	const { isLoading, data: document } = useQuery({
		queryKey: ["document_fech", docId],
		queryFn: () => getDocument(docId),
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
		<Box sx={{ px: { xs: 3, md: 6 }, py: 4 }}>
			<Stack spacing={2}>
				<DocumentHeader />
				<DocumentDetailsCard
					document={document ?? null}
					isLoading={isLoading}
				/>
				<DocumentEditorCard documentId={document?.id ?? null} />
			</Stack>
		</Box>
	);
};
