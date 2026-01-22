import { filterSuggestionItems } from "@blocknote/core/extensions";
import { BlockNoteView } from "@blocknote/mantine";
import {
	getDefaultReactSlashMenuItems,
	SuggestionMenuController,
	useCreateBlockNote,
} from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { useEffect, useMemo } from "react";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { updateInternalDocumentLinks } from "@/pages/document/utils/document-link-updater";
import { internalLinkPasteHandler } from "@/pages/document/utils/paste-handler";
import { EditorDialogProvider, useEditorDialog } from "./slash-commands";
import { createCustomSlashMenuItems } from "./slash-commands/custom-slash-menu-items";

type BlockNoteEditorProps = { documentId: string };

interface BlockNoteEditorInnerProps {
	editor: ReturnType<typeof useCreateBlockNote>;
}

function BlockNoteEditorInner({ editor }: BlockNoteEditorInnerProps) {
	const { openCreateDocumentDialog, openLinkDocumentDialog } =
		useEditorDialog();

	const customSlashItems = createCustomSlashMenuItems(editor, {
		openCreateDocumentDialog,
		openLinkDocumentDialog,
	});

	return (
		<div className=" bg-white">
			<BlockNoteView
				editor={editor}
				theme="light"
				slashMenu={true}
				sideMenu={true}
			>
				<SuggestionMenuController
					triggerCharacter="/"
					getItems={async (query) =>
						filterSuggestionItems(
							[...getDefaultReactSlashMenuItems(editor), ...customSlashItems],
							query,
						)
					}
				/>
			</BlockNoteView>
		</div>
	);
}

export function BlockNoteEditor({ documentId }: BlockNoteEditorProps) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: documentId is needed to recreate doc per document
	const doc = useMemo(() => new Y.Doc(), [documentId]);
	console.log(documentId, doc);

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
		<EditorDialogProvider>
			<BlockNoteEditorInner editor={editor} />
		</EditorDialogProvider>
	);
}
