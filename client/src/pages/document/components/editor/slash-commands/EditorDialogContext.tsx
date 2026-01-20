import type { BlockNoteEditor } from "@blocknote/core";
import { createContext, type ReactNode, useContext, useState } from "react";
import { CreateDocumentDialog } from "./CreateDocumentDialog";
import { LinkDocumentDialog } from "./LinkDocumentDialog";

interface EditorDialogContextValue {
	openCreateDocumentDialog: (editor: BlockNoteEditor) => void;
	openLinkDocumentDialog: (editor: BlockNoteEditor) => void;
}

const EditorDialogContext = createContext<EditorDialogContextValue | null>(
	null,
);

interface EditorDialogProviderProps {
	children: ReactNode;
}

export const EditorDialogProvider = ({
	children,
}: EditorDialogProviderProps) => {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [currentEditor, setCurrentEditor] = useState<BlockNoteEditor | null>(
		null,
	);

	const openCreateDocumentDialog = (editor: BlockNoteEditor) => {
		setCurrentEditor(editor);
		setCreateDialogOpen(true);
	};

	const openLinkDocumentDialog = (editor: BlockNoteEditor) => {
		setCurrentEditor(editor);
		setLinkDialogOpen(true);
	};

	const handleDocumentCreated = (docId: string, title: string) => {
		if (!currentEditor) return;

		const url = `${window.location.origin}/docs/${docId}`;
		currentEditor.createLink(url, title);
		setCurrentEditor(null);
	};

	const handleDocumentSelected = (docId: string, title: string) => {
		if (!currentEditor) return;

		const url = `${window.location.origin}/docs/${docId}`;
		currentEditor.createLink(url, title);
		setCurrentEditor(null);
	};

	const handleCloseCreateDialog = () => {
		setCreateDialogOpen(false);
		setCurrentEditor(null);
	};

	const handleCloseLinkDialog = () => {
		setLinkDialogOpen(false);
		setCurrentEditor(null);
	};

	const value: EditorDialogContextValue = {
		openCreateDocumentDialog,
		openLinkDocumentDialog,
	};

	return (
		<EditorDialogContext.Provider value={value}>
			{children}
			<CreateDocumentDialog
				open={createDialogOpen}
				onClose={handleCloseCreateDialog}
				onDocumentCreated={handleDocumentCreated}
			/>
			<LinkDocumentDialog
				open={linkDialogOpen}
				onClose={handleCloseLinkDialog}
				onDocumentSelected={handleDocumentSelected}
			/>
		</EditorDialogContext.Provider>
	);
};

export const useEditorDialog = () => {
	const context = useContext(EditorDialogContext);
	if (!context) {
		throw new Error(
			"useEditorDialog must be used within an EditorDialogProvider",
		);
	}
	return context;
};
