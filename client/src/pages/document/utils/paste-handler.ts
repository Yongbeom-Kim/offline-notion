import type { BlockNoteEditor } from "@blocknote/core";
import { isInternalDocumentUrl, extractDocumentId } from "../../../utils/url";
import { getDocumentMetadata } from "@/hooks/use-document-store";

interface PasteHandlerContext {
	event: ClipboardEvent;
	editor: BlockNoteEditor;
	defaultPasteHandler: (context?: {
		prioritizeMarkdownOverHTML?: boolean;
		plainTextAsMarkdown?: boolean;
	}) => boolean | undefined;
}

type PasteHandler = (context: PasteHandlerContext) => boolean | undefined;

export const internalLinkPasteHandler: PasteHandler = ({ event, editor, defaultPasteHandler }) => {
	const text = event.clipboardData?.getData("text/plain");

	if (!text || !isInternalDocumentUrl(text, window.location.origin)) {
		return defaultPasteHandler();
	}

	const docId = extractDocumentId(text);
	if (!docId) {
		return defaultPasteHandler();
	}

	fetchDocumentAndCreateLink(docId, text, editor);
	return true;
};

async function fetchDocumentAndCreateLink(
	docId: string,
	url: string,
	editor: BlockNoteEditor,
) {
	try {
		const document = await getDocumentMetadata(docId);

		const linkText = document?.title || url;
		editor.createLink(url, linkText);
	} catch (error) {
		console.error("Failed to fetch document metadata for paste handler:", error);
		editor.createLink(url, url);
	}
}