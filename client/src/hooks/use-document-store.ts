import { Dexie, type EntityTable } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useRef, useState } from "react";
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

const initDocumentMetadataTable = (): DexieDocumentDB | null => {
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

export const useDocumentMetadataList = () => {
	const dexieDbRef = useRef<DexieDocumentDB | null>(
		initDocumentMetadataTable(),
	);
	const [refreshCounter, setRefreshCounter] = useState(0);
	const refreshDocumentList = useCallback(() => {
		setRefreshCounter((prev) => prev + 1);
	}, []);

	const documentList = useLiveQuery(
		() => {
			if (!dexieDbRef.current) return [];
			return dexieDbRef.current.document_metadata
				.where("[isActive+updatedAt]")
				.between([1, Dexie.minKey], [1, Dexie.maxKey])
				.reverse()
				.toArray();
		},
		[refreshCounter],
		[],
	);
	const isLoading = documentList === undefined;

	return {
		documentList: documentList,
		isLoading,
		refreshDocumentList,
	};
};

export const useDocumentStore = () => {
	const dexieDbRef = useRef<DexieDocumentDB | null>(
		initDocumentMetadataTable(),
	);

	const createDocument = async (title: string): Promise<string> => {
		if (!dexieDbRef.current) {
			throw new Error("Database is not initialized yet.");
		}
		const db = dexieDbRef.current;

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

	const updateDocument = async (
		id: string,
		updates: Partial<
			Omit<
				DocumentMetadata,
				"id" | "updatedAt" | "createdAt" | "deletedAt" | "isActive"
			>
		>,
	): Promise<DocumentMetadata | undefined> => {
		if (!dexieDbRef.current) {
			throw new Error("Database is not initialized yet.");
		}
		const db = dexieDbRef.current;
		const now = Date.now();

		return await db.transaction("rw", db.document_metadata, async () => {
			await db.document_metadata.update(id, { ...updates, updatedAt: now });
			return db.document_metadata.get(id);
		});
	};

	const deleteDocument = async (
		id: string,
	): Promise<DocumentMetadata | undefined> => {
		if (!dexieDbRef.current) {
			throw new Error("Database is not initialized yet.");
		}
		const db = dexieDbRef.current;
		const now = Date.now();

		return await db.transaction("rw", db.document_metadata, async () => {
			await db.document_metadata.update(id, { isActive: 0, deletedAt: now });
			return db.document_metadata.get(id);
		});
	};

	const getDocument = async (
		id: string,
	): Promise<DocumentMetadata | undefined> => {
		if (!dexieDbRef.current) {
			throw new Error("Database is not initialized yet.");
		}
		const db = dexieDbRef.current;
		return await db.document_metadata.get(id);
	};

	return {
		createDocument,
		updateDocument,
		deleteDocument,
		getDocument,
	};
};
