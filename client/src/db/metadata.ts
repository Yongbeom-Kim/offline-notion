import { Dexie, type EntityTable } from "dexie";
import { v7 as uuid_v7 } from "uuid";

const DB_NAME = "offline_notion" as const;

export type DocumentMetadata = {
	id: string;
	title: string;
	createdAt: number;
	updatedAt: number;
	deletedAt: number | null;
	isActive: 0 | 1;
};

export type DexieDocumentDB = Dexie & {
	document_metadata: EntityTable<DocumentMetadata, "id">;
};

let dbInstance: DexieDocumentDB | null = null;

export const getDocumentMetadataDb = (): DexieDocumentDB | null => {
	if (typeof window === "undefined") return null;
	if (dbInstance) {
		return dbInstance;
	}

	const db = new Dexie(DB_NAME) as DexieDocumentDB;
	db.version(1).stores({
		document_metadata: "id, title, createdAt, [isActive+updatedAt], deletedAt",
	});

	dbInstance = db;
	return db;
};

export const createDocumentMetadata = async (
	title: string,
): Promise<string> => {
	const db = getDocumentMetadataDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	const now = Date.now();
	const record: DocumentMetadata = {
		id: uuid_v7(),
		title: title.trim() || "Untitled document",
		createdAt: now,
		updatedAt: now,
		deletedAt: null,
		isActive: 1,
	};

	return await db.transaction("rw", db.document_metadata, async () => {
		return await db.document_metadata.add(record);
	});
};

export const updateDocumentMetadata = async (
	id: string,
	updates: Partial<
		Omit<
			DocumentMetadata,
			"id" | "updatedAt" | "createdAt" | "deletedAt" | "isActive"
		>
	>,
): Promise<DocumentMetadata | undefined> => {
	const db = getDocumentMetadataDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	const now = Date.now();

	return await db.transaction("rw", db.document_metadata, async () => {
		await db.document_metadata.update(id, { ...updates, updatedAt: now });
		return db.document_metadata.get(id);
	});
};

export const deleteDocumentMetadata = async (
	id: string,
): Promise<DocumentMetadata | undefined> => {
	const db = getDocumentMetadataDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	const now = Date.now();

	return await db.transaction("rw", db.document_metadata, async () => {
		await db.document_metadata.update(id, { isActive: 0, deletedAt: now });
		return db.document_metadata.get(id);
	});
};

export const getDocumentMetadata = async (
	id: string,
): Promise<DocumentMetadata | undefined> => {
	const db = getDocumentMetadataDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	return await db.document_metadata.get(id);
};

export const getDocumentMetadataList = async () => {
	const db = getDocumentMetadataDb();
	if (!db) {
		throw new Error("IndexedDB is not available in this environment.");
	}
	return await db.document_metadata
		.where("[isActive+updatedAt]")
		.between([1, Dexie.minKey], [1, Dexie.maxKey])
		.reverse()
		.toArray();
};
