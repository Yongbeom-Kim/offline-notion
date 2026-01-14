export type DocumentRecord = {
	id: string;
	title: string;
	createdAt: number;
	updatedAt: number;
};

const DB_NAME = "offline-notion";
const DB_VERSION = 1;
const STORE_NAME = "documents";

const openDatabase = (): Promise<IDBDatabase> =>
	new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
				store.createIndex("updatedAt", "updatedAt");
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
	new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

const completeTransaction = (tx: IDBTransaction): Promise<void> =>
	new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);
	});

const generateId = () =>
	globalThis.crypto?.randomUUID?.() ??
	`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const listDocuments = async (): Promise<DocumentRecord[]> => {
	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readonly");
	const store = tx.objectStore(STORE_NAME);
	const request = store.getAll();
	const results = await requestToPromise(request);
	await completeTransaction(tx);
	db.close();
	return results.sort((a, b) => b.updatedAt - a.updatedAt);
};

export const getDocument = async (
	documentId: string,
): Promise<DocumentRecord | undefined> => {
	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readonly");
	const store = tx.objectStore(STORE_NAME);
	const request = store.get(documentId);
	const result = await requestToPromise(request);
	await completeTransaction(tx);
	db.close();
	return result;
};

export const createDocument = async (title: string): Promise<DocumentRecord> => {
	const now = Date.now();
	const record: DocumentRecord = {
		id: generateId(),
		title: title.trim() || "Untitled document",
		createdAt: now,
		updatedAt: now,
	};

	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	await requestToPromise(store.add(record));
	await completeTransaction(tx);
	db.close();
	return record;
};

export const updateDocument = async (
	documentId: string,
	updates: Partial<Pick<DocumentRecord, "title" | "updatedAt">>,
): Promise<DocumentRecord | undefined> => {
	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	const existingRequest = store.get(documentId);
	const existing = await requestToPromise(existingRequest);

	if (!existing) {
		await completeTransaction(tx);
		db.close();
		return undefined;
	}

	const updated: DocumentRecord = {
		...existing,
		...updates,
		updatedAt: updates.updatedAt ?? Date.now(),
	};
	await requestToPromise(store.put(updated));
	await completeTransaction(tx);
	db.close();
	return updated;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
	const db = await openDatabase();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const store = tx.objectStore(STORE_NAME);
	await requestToPromise(store.delete(documentId));
	await completeTransaction(tx);
	db.close();
};
