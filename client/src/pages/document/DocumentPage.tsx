import { Box } from "@mui/joy";
import { DocumentEditorCard } from "./components/DocumentEditorCard";
import { DocumentNotFoundCard } from "./components/DocumentNotFoundCard";
import { DocumentTitle } from "./components/DocumentTitle";
import { useDocumentContext } from "./context/document-context/DocumentContext";

export const DocumentPage = () => {
	const { metadata } = useDocumentContext();

	if (metadata.error) {
		return (
			<Box sx={{ px: { xs: 3, md: 6 }, py: 6 }}>
				<DocumentNotFoundCard />
			</Box>
		);
	}

	return (
		<Box sx={{ height: "100vh", width: "100%", p: 4, overflow: "auto" }}>
			<DocumentTitle
				document={metadata.data ?? null}
				isLoading={metadata.isLoading}
			/>
			<DocumentEditorCard documentId={metadata.data?.id ?? null} />
		</Box>
	);
};
