import { filterSuggestionItems } from "@blocknote/core/extensions";
import { BlockNoteView } from "@blocknote/mantine";
import {
	getDefaultReactSlashMenuItems,
	SuggestionMenuController,
	useCreateBlockNote,
} from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { useGoogleProvider } from "@/integrations/google";
import { updateInternalDocumentLinks } from "@/pages/document/utils/document-link-updater";
import { pasteHandler } from "@/pages/document/utils/paste-handler";
import { getRandomCursorColor } from "@/utils/color";
import { EditorDialogProvider, useEditorDialog } from "./slash-commands";
import { createCustomSlashMenuItems } from "./slash-commands/custom-slash-menu-items";
// import { IndexeddbPersistence } from "y-indexeddb";
import { OfflineNotionProvider } from "./y-provider";

type BlockNoteEditorProps = { documentId: string };

interface BlockNoteEditorInnerProps {
	persistence: OfflineNotionProvider;
	doc: Y.Doc;
}

function BlockNoteEditorInner({ persistence, doc }: BlockNoteEditorInnerProps) {
	const { openCreateDocumentDialog, openLinkDocumentDialog } =
		useEditorDialog();

	const userColor = useMemo(() => getRandomCursorColor(), []);

	const editor = useCreateBlockNote({
		collaboration: {
			provider: persistence,
			fragment: doc.getXmlFragment("document-store"),
			user: { name: "You", color: userColor },
			showCursorLabels: "activity",
		},
		pasteHandler: pasteHandler,
	});

	const customSlashItems = createCustomSlashMenuItems(editor, {
		openCreateDocumentDialog,
		openLinkDocumentDialog,
	});

	persistence.once("synced", async () => {
		await updateInternalDocumentLinks(editor, window.location.origin);
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
	const { accessToken: googleDriveAccessToken } = useGoogleProvider();

	// biome-ignore lint/correctness/useExhaustiveDependencies: documentId is needed to recreate doc per document
	const doc = useMemo(() => new Y.Doc(), [documentId]);
	const [persistence, setPersistence] =
		useState<OfflineNotionProvider | null>();

	useEffect(() => {
		const persistence = new OfflineNotionProvider(`doc-${documentId}`, doc, {
			googleDriveAccessToken,
		});
		setPersistence(persistence);

		return () => {
			persistence.destroy();
		};
	}, [documentId, doc, googleDriveAccessToken]);

	return (
		<EditorDialogProvider>
			{persistence && (
				<BlockNoteEditorInner persistence={persistence} doc={doc} />
			)}
		</EditorDialogProvider>
	);
}
