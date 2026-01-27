import type * as Y from "yjs";
import type { UpdateHandler } from "./interface";

type BroadcastChannelMessage = {
	type: "update";
	payload: Uint8Array;
};

export class BroadcastChannelHandler implements UpdateHandler {
	private _bc: BroadcastChannel;
	private _updateCallback: ((update: Uint8Array) => void) | null = null;
	private _destroyed: boolean = false;

	docId: string;

	constructor(docId: string) {
		this.docId = docId;
		this._bc = new BroadcastChannel(docId);
		this._bc.onmessage = this._handleMessage;
	}

	async init(_doc: Y.Doc): Promise<void> {
		// noop - BroadcastChannel doesn't need initialization with doc state
		return;
	}

	async persistUpdate(_update: Uint8Array): Promise<void> {
		// noop - BroadcastChannel doesn't persist
		return;
	}

	async broadcastUpdate(update: Uint8Array): Promise<void> {
		const message: BroadcastChannelMessage = {
			type: "update",
			payload: update,
		};
		this._bc.postMessage(message);
	}

	onUpdateReceived(callback: (update: Uint8Array) => void): void {
		this._updateCallback = callback;
	}

	private _handleMessage = (ev: MessageEvent<BroadcastChannelMessage>) => {
		const message = ev.data;
		if (message.type !== "update") {
			console.error(`Unreachable code, BroadcastChannel message: ${message}`);
			return;
		}
		if (this._updateCallback) {
			this._updateCallback(message.payload);
		}
	};

	async destroy(): Promise<void> {
		if (this._destroyed) return;
		this._destroyed = true;
		this._updateCallback = null;
		this._bc.close();
	}
}
