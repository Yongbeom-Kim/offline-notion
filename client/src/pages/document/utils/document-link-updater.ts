import type { Block, BlockNoteEditor } from "@blocknote/core";
import { getDocumentMetadata } from "@/db/metadata";
import { extractDocumentId, isInternalDocumentHref } from "../../../utils/url";

/**
 * Finds all internal document links in a block tree and returns their locations
 */
function findInternalLinksInBlocks(
	blocks: Block[],
	origin: string,
): Array<{
	blockId: string;
	linkIndex: number;
	docId: string;
	currentText: string;
}> {
	const links: Array<{
		blockId: string;
		linkIndex: number;
		docId: string;
		currentText: string;
	}> = [];

	function traverseBlocks(blocks: Block[]) {
		for (const block of blocks) {
			if (block.content && Array.isArray(block.content)) {
				for (let i = 0; i < block.content.length; i++) {
					const item = block.content[i];
					if (
						item.type === "link" &&
						item.href &&
						isInternalDocumentHref(item.href, origin)
					) {
						const docId = extractDocumentId(item.href);
						if (docId) {
							// Get the text content of the link
							const linkText = item.content?.map((c) => c.text).join("") || "";
							links.push({
								blockId: block.id,
								linkIndex: i,
								docId,
								currentText: linkText,
							});
						}
					}
				}
			}

			if (block.children && Array.isArray(block.children)) {
				traverseBlocks(block.children);
			}
		}
	}

	traverseBlocks(blocks);
	return links;
}

/**
 * Updates the text content of a specific link within a block
 */
function updateLinkText(
	editor: BlockNoteEditor,
	blockId: string,
	linkIndex: number,
	newText: string,
): void {
	const block = editor.getBlock(blockId);
	if (!block || !block.content || !Array.isArray(block.content)) {
		return;
	}

	const linkItem = block.content[linkIndex];
	if (
		linkItem?.type === "link" &&
		linkItem.content &&
		Array.isArray(linkItem.content)
	) {
		// Update the link's text content
		const updatedContent = [...block.content];
		updatedContent[linkIndex] = {
			...linkItem,
			content: [{ type: "text", text: newText, styles: {} }],
		};

		// Update the block with new content
		editor.updateBlock(blockId, {
			content: updatedContent,
		});
	}
}

/**
 * Scans all blocks in the editor and updates internal document links with latest titles
 */
export async function updateInternalDocumentLinks(
	editor: BlockNoteEditor,
	origin: string,
): Promise<void> {
	try {
		const allBlocks = editor.document;
		const internalLinks = findInternalLinksInBlocks(allBlocks, origin);

		if (internalLinks.length === 0) {
			return; // No links to update
		}

		const docIds = [...new Set(internalLinks.map((link) => link.docId))];
		const documents = await Promise.all(
			docIds.map((docId) => getDocumentMetadata(docId)),
		);

		const documentMap = new Map<string, DocumentMetadata | undefined>();
		docIds.forEach((docId, index) => {
			documentMap.set(docId, documents[index]);
		});

		for (const link of internalLinks) {
			const document = documentMap.get(link.docId);
			const newTitle = document?.title || "Deleted document";

			if (newTitle !== link.currentText) {
				updateLinkText(editor, link.blockId, link.linkIndex, newTitle);
			}
		}
	} catch (error) {
		console.error("Failed to update internal document links:", error);
	}
}
