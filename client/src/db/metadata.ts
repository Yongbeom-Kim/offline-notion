import { Dexie, type EntityTable } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { v7 as uuid_v7 } from "uuid";

const DB_NAME = "offline_notion" as const;

export const ROOT_PARENT_ID = "__ROOT__" as const;

export enum NodeType {
	Document = 0,
	Folder = 1,
}

export type NodeMetadata = {
	id: string;
	title: string;
	createdAt: number;
	updatedAt: number;
	inactivatedAt: number | null;
	isActive: 0 | 1;
	parentId: string;
	childrenIds: string[];
	type: NodeType;
};

export type DexieDb = Dexie & {
	node_metadata: EntityTable<NodeMetadata, "id">;
};

let dbInstance: DexieDb | null = null;

export const getDexieDb = (): DexieDb | null => {
	if (typeof window === "undefined") return null;
	if (dbInstance) {
		return dbInstance;
	}

	const db = new Dexie(DB_NAME) as DexieDb;
	db.version(1).stores({
		node_metadata:
			"id, title, createdAt, [isActive+updatedAt], deletedAt, [parentId+type]",
	});

	dbInstance = db;
	return db;
};

export const getNode = async (
	id: string,
): Promise<NodeMetadata | undefined> => {
	const db = getDexieDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	return db.node_metadata.get(id);
};

export const useGetNode = (id: string | null | undefined) => {
	const [data, isLoading, error] = useLiveQuery(
		() => {
			if (typeof window === "undefined")
				return [null, false, new Error("SSR Environment")];
			if (!id) return [null, false, new Error("Node ID is null or undefined")];
			return getNode(id).then(
				(value) => [value, false, null],
				(err) => [null, false, err],
			);
		},
		[id],
		[null, true, null],
	);

	return {
		data,
		error,
		isLoading,
	};
};

export const createNode = async (
	title: string,
	type: NodeType,
	parentId: string = ROOT_PARENT_ID,
) => {
	const db = getDexieDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	const now = Date.now();
	const record: NodeMetadata = {
		id: uuid_v7(),
		title: title.trim() || "Untitled",
		createdAt: now,
		updatedAt: now,
		inactivatedAt: null,
		isActive: 1,
		parentId,
		type,
		childrenIds: [],
	};

	return await db.transaction("rw", db.node_metadata, async () => {
		const id = await db.node_metadata.add(record);
		if (parentId !== ROOT_PARENT_ID) {
			const parent = await db.node_metadata.get(parentId);
			if (parent) {
				const childrenIds = Array.isArray(parent.childrenIds)
					? [...parent.childrenIds, id]
					: [id];
				await db.node_metadata.update(parentId, { childrenIds });
			}
		}
		return id;
	});
};

export const updateNodeTitle = async (id: string, newTitle: string) => {
	const db = getDexieDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	if (!newTitle.trim()) {
		throw new Error("Title is empty string");
	}
	const now = Date.now();
	await db.node_metadata.update(id, {
		title: newTitle.trim(),
		updatedAt: now,
	});
	return db.node_metadata.get(id);
};

export const deleteNote = async (id: string) => {
	const db = getDexieDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}

	const idsToDelete: string[] = [id];

	const _delHelper = async (id: string) => {
		const node = await getNode(id);
		if (node === undefined) {
			console.warn(`Node with id ${id} not found; skipping delete.`);
			return;
		}
		idsToDelete.push(...node.childrenIds);
		await Promise.all(node.childrenIds.map(_delHelper));
	};

	const now = Date.now();

	return await db.transaction("rw", db.node_metadata, async () => {
		await _delHelper(id);
		await db.node_metadata.bulkUpdate(
			idsToDelete.map((id) => ({
				key: id,
				changes: { isActive: 0, inactivatedAt: now },
			})),
		);
	});
};

const getRootNodes = async (): Promise<Record<NodeType, NodeMetadata[]>> => {
	const db = getDexieDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	const rootNodes = await db.node_metadata
		.where("parentId")
		.equals("__ROOT__")
		.and((node) => node.isActive === 1)
		.sortBy("updatedAt")
		.then((nodes) => nodes.reverse());

	const grouped: Record<NodeType, NodeMetadata[]> = {
		[NodeType.Document]: [],
		[NodeType.Folder]: [],
	};
	rootNodes.forEach((node) => {
		const type = node.type;
		grouped[type].push(node);
	});

	return grouped;
};

export const useGetRootNodes = () => {
	const [rootNodes, isLoading, error] = useLiveQuery(
		async () => {
			try {
				const grouped = await getRootNodes();
				return [grouped, false, null];
			} catch (e: unknown) {
				return [null, false, e];
			}
		},
		[],
		[null, true, null],
	);

	return {
		rootNodes,
		isLoading,
		error,
	};
};

export const getNodeChildren = async (
	parentId: string,
): Promise<NodeMetadata[]> => {
	const db = getDexieDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	const children = await db.node_metadata
		.where("parentId")
		.equals(parentId)
		.and((node) => node.isActive === 1)
		.sortBy("updatedAt")
		.then((nodes) => nodes.reverse());

	return children;
};

export const useGetNodeChildren = (parentId: string | null) => {
	const [children, isLoading, error] = useLiveQuery(
		async () => {
			try {
				if (parentId === null)
					return [null, false, new Error("ParentId is null")];
				const children = await getNodeChildren(parentId);
				return [children, false, null];
			} catch (e: unknown) {
				return [null, false, e];
			}
		},
		[parentId],
		[null, true, null],
	);

	return {
		children,
		isLoading,
		error,
	};
};

export const moveNode = async (
	id: string,
	newParentId: string,
): Promise<void> => {
	const db = getDexieDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}

	await db.transaction("rw", db.node_metadata, async () => {
		const node = await db.node_metadata.get(id);

		if (!node) {
			throw new Error(`Node with id ${id} not found.`);
		}

		if (node.parentId !== ROOT_PARENT_ID) {
			const oldParent = await db.node_metadata.get(node.parentId);
			if (oldParent) {
				const updatedChildrenIds = Array.isArray(oldParent.childrenIds)
					? oldParent.childrenIds.filter((childId) => childId !== id)
					: [];
				await db.node_metadata.update(oldParent.id, {
					childrenIds: updatedChildrenIds,
				});
			}
		}

		if (newParentId !== ROOT_PARENT_ID) {
			const newParent = await db.node_metadata.get(newParentId);
			if (newParent) {
				const updatedChildrenIds = Array.isArray(newParent.childrenIds)
					? [...newParent.childrenIds, id]
					: [id];
				await db.node_metadata.update(newParentId, {
					childrenIds: updatedChildrenIds,
				});
			}
		}

		await db.node_metadata.update(id, {
			parentId: newParentId,
			updatedAt: Date.now(),
		});
	});
};

const getAllActiveDocuments = () => {
	const db = getDexieDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	return db.node_metadata
		.where("isActive")
		.equals(1)
		.and((node) => node.type === NodeType.Document)
		.sortBy("updatedAt")
		.then((nodes) => nodes.reverse());
};

export const useGetAllActiveDocuments = () => {
	const [documents, isLoading, error] = useLiveQuery(
		async () => {
			try {
				const docs = await getAllActiveDocuments();
				return [docs, false, null];
			} catch (e: unknown) {
				return [null, false, e];
			}
		},
		[], // no dependencies since this should fetch every time the db changes
		[null, true, null],
	);

	return {
		documents,
		isLoading,
		error,
	};
};
