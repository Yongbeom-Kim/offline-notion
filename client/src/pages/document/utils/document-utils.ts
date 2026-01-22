import { type Block, BlockNoteEditor } from "@blocknote/core";
import { yXmlFragmentToBlocks } from "@blocknote/core/yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

/**
 * Get document content as BlockNote blocks from a document ID
 * @param documentId The document ID to load content for
 * @returns Array of BlockNote Block objects representing the document content
 */
export const getDocumentBlocks = async (
	documentId: string,
): Promise<Block[]> => {
	return new Promise((resolve, reject) => {
		const doc = new Y.Doc();
		const persistence = new IndexeddbPersistence(`doc-${documentId}`, doc);

		const timeoutId = setTimeout(() => {
			persistence.destroy();
			reject(new Error(`Timeout loading document content for ${documentId}`));
		}, 10000);

		persistence.on("synced", () => {
			clearTimeout(timeoutId);
			try {
				// Create a temporary editor instance for conversion
				const editor = BlockNoteEditor.create();
				const xmlFragment = doc.getXmlFragment("document-store");
				const blocks = yXmlFragmentToBlocks(editor, xmlFragment);
				resolve(blocks);
			} catch (error: unknown) {
				reject(error);
			}
		});

		persistence.on("error", (error: unknown) => {
			clearTimeout(timeoutId);
			persistence.destroy();
			reject(error);
		});
	});
};

/**
 * Recursively searches an array of blocks and their children for blocks that match the predicate
 * @param blocks Array of blocks to search through
 * @param predicate A function that takes a block and returns true if it matches
 * @returns Array of blocks that fulfill the predicate
 */
export const findBlocks = (
	blocks: Block[],
	predicate: (b: Block) => boolean,
): Block[] => {
	const result: Block[] = [];

	const search = (block: Block) => {
		if (predicate(block)) {
			result.push(block);
		}
		if (block.children && Array.isArray(block.children)) {
			for (const child of block.children) {
				search(child);
			}
		}
	};

	for (const block of blocks) {
		search(block);
	}

	return result;
};
