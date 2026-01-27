import { ObservableV2 } from "lib0/observable";
import * as Y from "yjs";
import {
	BroadcastChannelHandler,
	IndexedDbHandler,
	type UpdateHandler,
} from "./handler";

const INTERNAL_ORIGIN = Symbol("offline-notion-provider");

export class OfflineNotionProvider extends ObservableV2<{
	synced: () => void;
	error: (error: Error) => void;
}> {
	docId: string;
	doc: Y.Doc;
	handlers: UpdateHandler[];

	constructor(docId: string, doc: Y.Doc) {
		super();
		const indexedDbHandler = new IndexedDbHandler(docId, INTERNAL_ORIGIN);
		const broadcastChannelHandler = new BroadcastChannelHandler(docId);

		this.handlers = [indexedDbHandler, broadcastChannelHandler];

		this.docId = docId;
		this.doc = doc;

		this.doc.on("update", this.handleDocUpdate);
		broadcastChannelHandler.onUpdateReceived(this.handleBroadcastUpdate);
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

	handleBroadcastUpdate = (update: Uint8Array) => {
		this._writeUpdateToDoc(update);
	};

	_writeUpdateToDoc(update: Uint8Array) {
		Y.applyUpdate(this.doc, update, INTERNAL_ORIGIN);
	}

	async destroy(): Promise<void> {
		this.doc.off("update", this.handleDocUpdate);
		await Promise.all(this.handlers.map((handler) => handler.destroy()));
		super.destroy();
	}
}
