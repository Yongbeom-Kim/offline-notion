import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { useEffect, useMemo } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { updateInternalDocumentLinks } from "@/pages/document/utils/document-link-updater";
import { internalLinkPasteHandler } from "@/pages/document/utils/paste-handler";

type BlockNoteEditorProps = { documentId: string };

export function BlockNoteEditor({ documentId }: BlockNoteEditorProps) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: documentId is needed to recreate doc per document
	const doc = useMemo(() => new Y.Doc(), [documentId]);

	const editor = useCreateBlockNote({
		collaboration: {
			fragment: doc.getXmlFragment("document-store"),
			user: { name: "Offline Notion", color: "#0ea5e9" },
			showCursorLabels: "activity",
		},
		pasteHandler: internalLinkPasteHandler,
	});

	useEffect(() => {
		const persistence = new IndexeddbPersistence(`doc-${documentId}`, doc);

		persistence.once("synced", async () => {
			await updateInternalDocumentLinks(editor, window.location.origin);
		});

		return () => {
			persistence.destroy();
		};
	}, [documentId, doc, editor]);

	return (
		<div className="h-full w-full bg-white">
			<BlockNoteView editor={editor} theme="light" className="h-full" />
		</div>
	);
}
