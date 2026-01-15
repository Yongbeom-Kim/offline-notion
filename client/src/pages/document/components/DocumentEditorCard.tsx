import { Card, Typography } from "@mui/joy";
import { ClientOnly } from "@tanstack/react-router";
import { BlockNoteEditor } from "@/pages/document/components/editor/BlockNoteEditor";

type DocumentEditorCardProps = {
	documentId: string | null;
};

export const DocumentEditorCard = ({ documentId }: DocumentEditorCardProps) => {
	return (
		<Card variant="soft" sx={{ p: 2, minHeight: 600 }}>
			<ClientOnly>
				{documentId ? (
					<BlockNoteEditor documentId={documentId} />
				) : (
					<Typography level="body-md">Loading editor...</Typography>
				)}
			</ClientOnly>
		</Card>
	);
};
