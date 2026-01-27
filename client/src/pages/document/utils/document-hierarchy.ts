import { getNode, ROOT_PARENT_ID } from "@/integrations/db/metadata";

/**
 * Check if a node is an ancestor of another node by walking up the parent chain
 * @param ancestorId The potential ancestor node ID
 * @param descendantId The potential descendant node ID
 * @returns true if ancestorId is an ancestor of descendantId
 */
export async function isAncestorOf(
	ancestorId: string,
	descendantId: string,
): Promise<boolean> {
	let currentId: string | null = descendantId;

	while (currentId && currentId !== ROOT_PARENT_ID) {
		const node = await getNode(currentId);
		if (!node) return false;

		if (node.parentId === ancestorId) {
			return true;
		}

		currentId = node.parentId;
	}

	return false;
}

/**
 * Get the full path from root to a given node
 * @param nodeId The target node ID
 * @returns Array of node IDs from root to the target (inclusive)
 */
export async function getPathToNode(nodeId: string): Promise<string[]> {
	const path: string[] = [];
	let currentId: string | null = nodeId;

	while (currentId && currentId !== ROOT_PARENT_ID) {
		path.unshift(currentId);
		const node = await getNode(currentId);
		if (!node) break;
		currentId = node.parentId;
	}

	return path;
}
