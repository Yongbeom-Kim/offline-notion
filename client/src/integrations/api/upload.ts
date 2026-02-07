import axios, { type AxiosInstance } from "axios";

const DEFAULT_UPLOAD_TIMEOUT_MS = 10000;

const apiClient: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001",
	timeout: 30000,
});

export type AcquireUploadLockParams = {
	docId: string;
	nonce: string;
	/** Time-to-live in milliseconds. Defaults to 10000ms (10s). */
	ttl?: number;
};

export type ReleaseUploadLockParams = {
	docId: string;
	nonce: string;
};

/**
 * Acquire an upload lock for a document.
 * This should be called before starting an upload to prevent concurrent uploads.
 *
 * @param params - The parameters for acquiring the lock
 * @param params.docId - The document ID to lock
 * @param params.nonce - A unique identifier for this lock acquisition
 * @param params.ttl - Optional time-to-live in milliseconds (defaults to 10000ms)
 */
export const acquireUploadLock = async ({
	docId,
	nonce,
	ttl = DEFAULT_UPLOAD_TIMEOUT_MS,
}: AcquireUploadLockParams): Promise<boolean> => {
	try {
		const res = await apiClient.post(
			`/upload/g/start/${encodeURIComponent(docId)}`,
			null,
			{
				params: { nonce, ttl },
				validateStatus: () => true,
			},
		);

		return res.status === 200;
	} catch (e) {
		console.error(e);
		return false;
	}
};

/**
 * Release an upload lock for a document.
 * This should be called after completing an upload to allow other clients to upload.
 *
 * @param params - The parameters for releasing the lock
 * @param params.docId - The document ID to unlock
 * @param params.nonce - The same nonce used when acquiring the lock
 * @returns Promise<boolean> - True if the lock was released, false if it was not held or already released
 */
export const releaseUploadLock = async ({
	docId,
	nonce,
}: ReleaseUploadLockParams): Promise<boolean> => {
	try {
		const res = await apiClient.post(
			`/upload/g/end/${encodeURIComponent(docId)}`,
			null,
			{
				params: { nonce },
				validateStatus: () => true,
			},
		);
		return res.status === 200;
	} catch (e) {
		console.error(e);
		return false;
	}
};

/**
 * Check if the upload lock is still held for the given document and nonce.
 * This does NOT release the lock.
 *
 * @param docId - The document ID to check
 * @param nonce - The unique identifier used to acquire the lock
 * @returns Promise<boolean> - True if the lock is still held, false otherwise
 *
 * Implementation follows server/cmd/upload.go: 200 OK = lock is held, 409 = not held, any error = not held
 */
export const checkUploadLock = async (
	docId: string,
	nonce: string,
): Promise<boolean> => {
	try {
		const res = await apiClient.get(
			`/upload/g/check/${encodeURIComponent(docId)}`,
			{
				params: { nonce },
				validateStatus: () => true,
			},
		);
		// Follows Go code: 200 (OK) if lock is held, 409 (Conflict) if not held, others treated as not held
		return res.status === 200;
	} catch (e) {
		console.error(e);
		return false;
	}
};

export type WithUploadLockCallbackFns = {
	refresh: () => Promise<boolean>;
	check: () => Promise<boolean>;
	release: () => Promise<boolean>;
};

/**
 * Execute a function while holding an upload lock.
 * Automatically acquires the lock before execution and releases it after.
 *
 * @param docId - The document ID to lock
 * @param fn - The async function to execute while holding the lock
 * @param ttl - Optional time-to-live for the lock in milliseconds
 * @returns The result of the function
 */
export const withUploadLock = async <T>(
	docId: string,
	fn: (fns: WithUploadLockCallbackFns) => Promise<T>,
	ttl: number,
	onTimeout?: () => unknown,
): Promise<T> => {
	return new Promise(async (_resolve, reject) => {
		setTimeout(() => {
			onTimeout?.();
			reject(new Error(`withUploadLock: Operation timed out after ${ttl}ms`));
		}, ttl);

		const nonce = crypto.randomUUID();

		await acquireUploadLock({ docId, nonce, ttl });

		try {
			return await fn({
				check: async () => await checkUploadLock(docId, nonce),
				refresh: async () => await acquireUploadLock({ docId, nonce, ttl }),
				release: async () => await releaseUploadLock({ docId, nonce }),
			});
		} finally {
			await releaseUploadLock({ docId, nonce });
		}
	});
};

export { apiClient };
