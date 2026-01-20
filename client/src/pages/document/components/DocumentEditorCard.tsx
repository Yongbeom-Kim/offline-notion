import { ClientOnly } from "@tanstack/react-router";
import { BlockNoteEditor } from "@/pages/document/components/editor/BlockNoteEditor";

type DocumentEditorCardProps = {
	documentId: string | null;
};

export const DocumentEditorCard = ({ documentId }: DocumentEditorCardProps) => {
	return (
		<ClientOnly>
			{documentId && <BlockNoteEditor documentId={documentId} />}
		</ClientOnly>
	);
};
