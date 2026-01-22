import type { Block } from "@blocknote/core";
import type { DocumentMetadata } from "@/db/metadata";
import { extractDocumentId, isInternalDocumentHref } from "../../../utils/url";
import { getDocumentBlocks } from "./document-utils";

/**
 * Data structure representing the document hierarchy
 */
export type HierarchyData = {
	/** Map of document ID to full metadata */
	documents: Map<string, DocumentMetadata>;
	/** Map of parent document ID to array of child document IDs (documents it links to) */
	childrenMap: Map<string, string[]>;
	/** Array of document IDs that have no parents (no other documents link to them) */
	rootDocumentIds: string[];
};

/**
 * Extract all internal document links from a document's content blocks
 * @param blocks The document content as BlockNote blocks
 * @param origin The current origin (window.location.origin) for link validation
 * @returns Array of document IDs that this document links to
 */
export function extractLinksFromBlocks(
	blocks: Block[],
	origin: string,
): string[] {
	const linkSet = new Set<string>();

	// TODO: (long-term), convert to iterative approach
	function traverseBlocks(blocks: Block[]) {
		for (const block of blocks) {
			if (block.content && Array.isArray(block.content)) {
				for (const item of block.content) {
					if (
						item.type === "link" &&
						item.href &&
						isInternalDocumentHref(item.href, origin)
					) {
						const docId = extractDocumentId(item.href);
						if (docId) {
							linkSet.add(docId);
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
	return Array.from(linkSet);
}

/**
 * Extract all internal document links from a single document
 * @param documentId The ID of the document to scan
 * @param origin The current origin for link validation
 * @returns Promise resolving to array of document IDs this document links to
 */
export async function extractLinksFromDocument(
	documentId: string,
	origin: string,
): Promise<string[]> {
	try {
		const blocks = await getDocumentBlocks(documentId);
		return extractLinksFromBlocks(blocks, origin);
	} catch (error) {
		console.warn(`Failed to extract links from document ${documentId}:`, error);
		return [];
	}
}

/**
 * Build the complete document hierarchy by scanning all documents for links
 * @param documents Array of all document metadata
 * @param origin The current origin for link validation
 * @returns Promise resolving to complete hierarchy data
 */
export async function buildDocumentHierarchy(
	documents: DocumentMetadata[],
	origin: string,
): Promise<HierarchyData> {
	const documentMap = new Map<string, DocumentMetadata>();
	for (const doc of documents) {
		documentMap.set(doc.id, doc);
	}

	const linkGraph = new Map<string, string[]>();
	const rootDocuments = new Set<string>(documents.map((doc) => doc.id));

	await Promise.all(
		documents.map(async (doc) => {
			const internalLinkIds = await extractLinksFromDocument(doc.id, origin);
			if (internalLinkIds.length > 0) {
				linkGraph.set(doc.id, internalLinkIds);
				for (const internalLinkId of internalLinkIds) {
					console.log(rootDocuments, internalLinkId);
					console.log(rootDocuments.delete(internalLinkId));
				}
			}
		}),
	);

	const rootDocumentIds = Array.from(rootDocuments)
		// Sort by updatedAt descending (most recently updated first)
		.sort((a, b) => {
			const docA = documentMap.get(a);
			const docB = documentMap.get(b);
			return (docB?.updatedAt ?? 0) - (docA?.updatedAt ?? 0);
		});

	return {
		documents: documentMap,
		childrenMap: linkGraph,
		rootDocumentIds,
	};
}

/**
 * Get the latest root document from hierarchy data
 * @param hierarchy The hierarchy data
 * @returns The most rec ently updated root document, or null if none exist
 */
export function getLatestRootDocument(
	hierarchy: HierarchyData,
): DocumentMetadata | null {
	if (hierarchy.rootDocumentIds.length === 0) {
		return null;
	}

	const latestId = hierarchy.rootDocumentIds[0]; // Already sorted by updatedAt
	return hierarchy.documents.get(latestId) ?? null;
}

/**
 * Get all child document IDs for a given document
 * @param hierarchy The hierarchy data
 * @param documentId The parent document ID
 * @returns Array of child document IDs
 */
export function getChildDocumentIds(
	hierarchy: HierarchyData,
	documentId: string,
): string[] {
	return hierarchy.childrenMap.get(documentId) ?? [];
}

/**
 * Get all parent document IDs for a given document
 * @param hierarchy The hierarchy data
 * @param documentId The child document ID
 * @returns Array of parent document IDs
 */
export function getParentDocumentIds(
	hierarchy: HierarchyData,
	documentId: string,
): string[] {
	const parents: string[] = [];
	for (const [parentId, children] of hierarchy.childrenMap.entries()) {
		if (children.includes(documentId)) {
			parents.push(parentId);
		}
	}
	return parents;
}

export function isAncestorOf(
	ancestor: string,
	child: string,
	hierarchyData: HierarchyData,
) {
	const childrenMap = hierarchyData.childrenMap;
	const visited = new Set<string>();
	function dfs(current: string): boolean {
		if (visited.has(current)) return false;
		visited.add(current);

		const children = childrenMap.get(current) ?? [];
		if (children.includes(child)) {
			return true;
		}
		for (const next of children) {
			if (dfs(next)) {
				return true;
			}
		}
		return false;
	}
	return dfs(ancestor);
}
