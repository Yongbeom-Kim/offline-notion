import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { useEffect, useMemo } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

type BlockNoteEditorProps = { documentId: string };

export function BlockNoteEditor({ documentId }: BlockNoteEditorProps) {
	const doc = useMemo(() => new Y.Doc(), [documentId]);

	useEffect(() => {
		const p = new IndexeddbPersistence(`doc-${documentId}`, doc);
		return () => {
			p.destroy();
		};
	}, [documentId, doc]);

	const editor = useCreateBlockNote({
		collaboration: {
			doc,
			fragment: doc.getXmlFragment("document-store"),
			user: { name: "Offline Notion", color: "#0ea5e9" },
			showCursorLabels: "activity",
		},
	});

	return (
		<div className="h-full w-full bg-white">
			<BlockNoteView editor={editor} theme="light" className="h-full" />
		</div>
	);
}
