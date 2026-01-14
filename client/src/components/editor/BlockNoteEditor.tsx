import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

export function BlockNoteEditor() {
	const doc = new Y.Doc();
	// TODO: implement new IDB provider for persistence
	new IndexeddbPersistence("name", doc);

	const editor = useCreateBlockNote({
		collaboration: {
			fragment: doc.getXmlFragment("document-store"),
			user: {
				name: "My Username",
				color: "#ff0000",
			},
			showCursorLabels: "activity",
		},
	});

	return (
		<div className="h-screen w-full bg-white">
			<BlockNoteView editor={editor} theme="light" className="h-full" />
		</div>
	);
}
