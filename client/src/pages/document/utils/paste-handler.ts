import type { BlockNoteEditor } from "@blocknote/core";
import { getNode } from "@/db/metadata";
import { extractDocumentId, isInternalDocumentUrl } from "../../../utils/url";

interface PasteHandlerContext {
	event: ClipboardEvent;
	editor: BlockNoteEditor;
	defaultPasteHandler: (context?: {
		prioritizeMarkdownOverHTML?: boolean;
		plainTextAsMarkdown?: boolean;
	}) => boolean | undefined;
}

type PasteHandler = (context: PasteHandlerContext) => boolean | undefined;

export const pasteHandler: PasteHandler = ({
	event,
	editor,
	defaultPasteHandler,
}) => {
	const text = event.clipboardData?.getData("text/plain");

	if (text && isInternalDocumentUrl(text, window.location.origin)) {
		return internalLinkPasteHandler({ event, editor, defaultPasteHandler });
	}

	// if (text && isHttpsUrl(text)) {
	// 	return externalLinkPasteHandler({event, editor, defaultPasteHandler})
	// }

	return defaultPasteHandler();
};

const internalLinkPasteHandler: PasteHandler = ({
	event,
	editor,
	defaultPasteHandler,
}) => {
	const text = event.clipboardData?.getData("text/plain");

	if (!text) {
		return defaultPasteHandler();
	}

	const docId = extractDocumentId(text);
	if (!docId) {
		return defaultPasteHandler();
	}

	fetchDocumentAndCreateLink(docId, text, editor);
	return true;
};

/*
Long-term TOOD:

This approach fails because you cannot reliably fetch() arbitrary sites' html client-side.
The right way to do this is to fetch() server-side instead. what a pain.
*/
// const externalLinkPasteHandler: PasteHandler = ({
// 	event,
// 	editor,
// }) => {
// 	const url = event.clipboardData?.getData("text/plain");
// 	if (!url) return;

// 	(async () => {
// 		try {
// 			// Try to fetch the url with no-cors mode (will almost always fail for cross-origin HTML)
// 			const fetchResp = await fetch(url, { mode: "cors" });
// 			const contentType = fetchResp.headers.get("Content-Type") || "";
// 			let title = "";

// 			if (/text\/html/i.test(contentType)) {
// 				const html = await fetchResp.text();
// 				const match = html.match(/<title>([^<]*)<\/title>/i);
// 				title = match ? match[1] : url;
// 			} else {
// 				title = url;
// 			}

// 			editor.createLink(url, title);
// 		} catch (e: unknown) {
// 			// Give user an immediate fallback if we can't fetch (network error, CORS, etc)
// 			editor.createLink(url, url);
// 			// Optionally, only log error in development to avoid spamming user consoles
// 			if (process.env.NODE_ENV !== "production") {
// 				console.error("Failed to fetch title, using URL as link text:", url, e);
// 			}
// 		}
// 	})();

// 	return true;
// }

async function fetchDocumentAndCreateLink(
	docId: string,
	url: string,
	editor: BlockNoteEditor,
) {
	try {
		const document = await getNode(docId);

		const linkText = document?.title || url;
		editor.createLink(url, linkText);
	} catch (error) {
		console.error(
			"Failed to fetch document metadata for paste handler:",
			error,
		);
		editor.createLink(url, url);
	}
}
