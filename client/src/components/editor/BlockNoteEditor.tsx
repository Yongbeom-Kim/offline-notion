import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { useEffect, useMemo } from "react";

type BlockNoteEditorProps = {
	documentId: string;
};

export function BlockNoteEditor({ documentId }: BlockNoteEditorProps) {
	const doc = useMemo(() => new Y.Doc(), [documentId]);
	const persistence = useMemo(
		() => new IndexeddbPersistence(`doc-${documentId}`, doc),
		[documentId, doc],
	);

	useEffect(() => {
		return () => {
			persistence.destroy();
			doc.destroy();
		};
	}, [doc, persistence]);

	const editor = useCreateBlockNote({
		collaboration: {
			fragment: doc.getXmlFragment("document-store"),
			user: {
				name: "Offline Notion",
				color: "#0ea5e9",
			},
			showCursorLabels: "activity",
		},
	});

	return (
		<div className="h-full w-full bg-white">
			<BlockNoteView editor={editor} theme="light" className="h-full" />
		</div>
	);
}
