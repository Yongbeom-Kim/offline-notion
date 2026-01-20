import type { BlockNoteEditor } from "@blocknote/core";
import type { DefaultReactSuggestionItem } from "@blocknote/react";
import { FilePlus, FileText } from "lucide-react";

interface DialogFunctions {
	openCreateDocumentDialog: (editor: BlockNoteEditor) => void;
	openLinkDocumentDialog: (editor: BlockNoteEditor) => void;
}

export const createCustomSlashMenuItems = (
	editor: BlockNoteEditor,
	dialogFunctions: DialogFunctions,
): DefaultReactSuggestionItem[] => {
	const { openCreateDocumentDialog, openLinkDocumentDialog } = dialogFunctions;

	const insertNewDocumentItem: DefaultReactSuggestionItem = {
		title: "New Document",
		onItemClick: () => {
			openCreateDocumentDialog(editor);
		},
		aliases: ["new", "create"],
		group: "Links",
		icon: <FilePlus size={16} />,
		subtext: "Create a new document and insert link",
	};

	const insertDocumentLinkItem: DefaultReactSuggestionItem = {
		title: "Link Document",
		onItemClick: () => {
			openLinkDocumentDialog(editor);
		},
		aliases: ["doc", "link"],
		group: "Links",
		icon: <FileText size={16} />,
		subtext: "Insert link to an existing document",
	};

	return [insertNewDocumentItem, insertDocumentLinkItem];
};
