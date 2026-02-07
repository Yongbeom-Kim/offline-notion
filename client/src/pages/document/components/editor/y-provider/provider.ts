import { ObservableV2 } from "lib0/observable";
import * as awarenessProtocol from "y-protocols/awareness.js";
import type * as Y from "yjs";
import {
	type AwarenessHandler,
	BroadcastChannelHandler,
	GoogleDriveHandler,
	IndexedDbHandler,
	type UpdateHandler,
} from "./handler";

const INTERNAL_ORIGIN = Symbol("offline-notion-provider");

type OfflineNotionProviderOptions = {
	googleDriveAccessToken?: string | null;
};

export class OfflineNotionProvider extends ObservableV2<{
	synced: () => void;
	error: (error: Error) => void;
}> {
	docId: string;
	doc: Y.Doc;
	handlers: UpdateHandler[];
	awareness: awarenessProtocol.Awareness;

	constructor(
		docId: string,
		doc: Y.Doc,
		options: OfflineNotionProviderOptions = {},
	) {
		super();
		const handlers: UpdateHandler[] = [
			new IndexedDbHandler(docId, INTERNAL_ORIGIN),
			new BroadcastChannelHandler(docId, INTERNAL_ORIGIN),
		];

		if (options.googleDriveAccessToken) {
			handlers.push(
				new GoogleDriveHandler(
					docId,
					INTERNAL_ORIGIN,
					options.googleDriveAccessToken,
				),
			);
		}

		this.handlers = handlers;

		this.docId = docId;
		this.doc = doc;

		this.doc.on("update", this.handleDocUpdate);
		this.awareness = new awarenessProtocol.Awareness(doc);

		// Register awareness with handlers that support it
		for (const handler of this.handlers) {
			if (this._isAwarenessHandler(handler)) {
				handler.registerAwareness(this.awareness);
			}
		}

		this.on("error", () => this.destroy());

		this.init();
	}

	async init() {
		try {
			await Promise.all(this.handlers.map((handler) => handler.init(this.doc)));
			this.emit("synced", []);
		} catch (e: unknown) {
			this.emit("error", [e instanceof Error ? e : new Error(String(e))]);
		}
	}

	handleDocUpdate = async (
		update: Uint8Array,
		origin: unknown,
		_doc: Y.Doc,
		_tr: Y.Transaction,
	) => {
		if (origin === this) return;
		try {
			await Promise.all(
				this.handlers.flatMap((handler) => [
					handler.persistUpdate(update),
					handler.broadcastUpdate(update),
				]),
			);
		} catch (e: unknown) {
			this.emit("error", [e instanceof Error ? e : new Error(String(e))]);
		}
	};

	private _isAwarenessHandler(
		handler: UpdateHandler,
	): handler is UpdateHandler & AwarenessHandler {
		return (
			"registerAwareness" in handler &&
			typeof (handler as AwarenessHandler).registerAwareness === "function"
		);
	}

	async destroy(): Promise<void> {
		this.doc.off("update", this.handleDocUpdate);
		await Promise.all(this.handlers.map((handler) => handler.destroy()));
		super.destroy();
	}
}
