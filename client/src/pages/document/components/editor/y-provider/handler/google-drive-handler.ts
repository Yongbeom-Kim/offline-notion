import * as Y from "yjs";
import type { UpdateHandler } from "./interface";
import { type Debounced, debounceWithForcedExecution } from "@/utils/debounce";
import { withUploadLock } from "@/integrations/api/upload";
import {
	getOrCreateFolder,
	getOrCreateFile,
	readFile,
	updateExistingFile,
} from "@/integrations/google/drive/api";
import axios, { AxiosInstance } from "axios";

type Options = {
	debounceInterval: number;
	maxDebounceWaitBeforeSave: number;
	gDriveLockTtl: number;
	baseFolderName: string;
};

const defaultOptions: Options = {
	debounceInterval: 2 * 1000, 
	maxDebounceWaitBeforeSave: 30 * 1000,
	gDriveLockTtl: 10 * 1000,
	baseFolderName: "offline-notion-data",
};

export class GoogleDriveHandler implements UpdateHandler {
	private _internalOrigin: symbol;
	private _googleDriveAccessToken: string;
	private _googleDriveAxiosInstance: AxiosInstance;
	private _destroyed: boolean = false;
	private _debouncedSyncUpdateWithGoogleDrive: Debounced<() => void>;

	docId: string;
	options: Options;
	doc: Y.Doc | null = null;

	constructor(
		docId: string,
		internalOrigin: symbol,
		googleDriveAccessToken: string,
		options: Partial<Options> = {},
	) {
		this.docId = docId;
		this._internalOrigin = internalOrigin;
		this._googleDriveAccessToken = googleDriveAccessToken;
		this._googleDriveAxiosInstance = axios.create({
			baseURL: "https://www.googleapis.com",
			headers: googleDriveAccessToken
				? {
						Authorization: `Bearer ${googleDriveAccessToken}`,
					}
				: {}
		})

		this.options = { ...defaultOptions, ...options };
		this._debouncedSyncUpdateWithGoogleDrive = debounceWithForcedExecution(
			() => this._syncWithGoogleDrive(),
			this.options.debounceInterval,
			this.options.maxDebounceWaitBeforeSave
		);
	}

	async init(doc: Y.Doc): Promise<void> {
		this.doc = doc;
	}

	async _syncWithGoogleDrive(): Promise<void> {
		const doc = this.doc;
		if (!doc) {
			throw new Error("GoogleDriveHandler: doc is not initialized");
		}

		await withUploadLock(
			this.docId,
			async ({ refresh }) => {

				// 1. Base Folder
				if (!await refresh()) return;
				const folderId = await getOrCreateFolder(
					this._googleDriveAxiosInstance,
					this.options.baseFolderName
				);

				// 2. File to sync with
				if (!await refresh()) return;
				const emptyState = Y.encodeStateAsUpdate(new Y.Doc());
				const file = await getOrCreateFile(
					this._googleDriveAxiosInstance,
					this.docId,
					emptyState,
					"application/octet-stream",
					folderId
				);
				
				// Step 3: Read the file contents from Google Drive
				if (!await refresh()) return;
				const remoteContent = await readFile(
					this._googleDriveAxiosInstance,
					file.id
				);

				// Step 4: Create temp doc to merge updates
				if (!await refresh()) return;
				const tempDoc = new Y.Doc();
				Y.applyUpdate(tempDoc, Y.encodeStateAsUpdate(doc));
				if (remoteContent.byteLength > 0) {
					Y.applyUpdate(tempDoc, remoteContent, this._internalOrigin);
				}


				// Step 5: Write merged state to GDrive + local
				if (!await refresh()) return;
				const mergedState = Y.encodeStateAsUpdate(tempDoc);
				try {
					await updateExistingFile(
						this._googleDriveAxiosInstance,
						file.id,
						mergedState,
						"application/octet-stream"
					);
				} catch (err) {
					console.error("Failed to write merged state to Google Drive:", err);
					return;
				}
				Y.applyUpdate(doc, mergedState, this._internalOrigin);
				
			},
			this.options.gDriveLockTtl,
			() => this._debouncedSyncUpdateWithGoogleDrive()
		);
	}

	async persistUpdate(_update: Uint8Array): Promise<void> {
		// Trigger debounced sync to Google Drive
		this._debouncedSyncUpdateWithGoogleDrive();
	}

	async broadcastUpdate(_update: Uint8Array): Promise<void> {
		// noop - Google Drive doesn't broadcast
	}

	async destroy(): Promise<void> {
		if (this._destroyed) return;
		this._destroyed = true;
		this._debouncedSyncUpdateWithGoogleDrive.cancel();
		this.doc = null;
	}
}
