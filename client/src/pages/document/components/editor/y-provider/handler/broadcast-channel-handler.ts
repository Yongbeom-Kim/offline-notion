import * as awarenessProtocol from "y-protocols/awareness";
import type * as Y from "yjs";
import type { AwarenessHandler, UpdateHandler } from "./interface";

type BroadcastChannelMessage =
	| {
			type: "update";
			payload: Uint8Array;
	  }
	| {
			type: "awareness-query";
	  }
	| {
			type: "awareness-update";
			payload: Uint8Array;
	  };

export class BroadcastChannelHandler
	implements UpdateHandler, AwarenessHandler
{
	private _internalOrigin: symbol;
	private _bc: BroadcastChannel;
	private _updateCallback: ((update: Uint8Array) => void) | null = null;
	private _destroyed: boolean = false;
	private _awareness: awarenessProtocol.Awareness | undefined;

	docId: string;

	constructor(docId: string, internalOrigin: symbol) {
		this.docId = docId;
		this._internalOrigin = internalOrigin;
		this._bc = new BroadcastChannel(docId);
		this._bc.onmessage = this._handleMessage;
	}

	registerAwareness(awareness: awarenessProtocol.Awareness): void {
		this._awareness = awareness;
		this._awareness.on("update", this._handleAwarenessUpdate);
		const queryMessage: BroadcastChannelMessage = {
			type: "awareness-query",
		};
		this._bc.postMessage(queryMessage);
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
		console.log(message);
		if (message.type === "update" && this._updateCallback) {
			return this._updateCallback(message.payload);
		}
		if (message.type === "awareness-query" && this._awareness) {
			const allKnownClientIds = Array.from(this._awareness.getStates().keys());
			const update = awarenessProtocol.encodeAwarenessUpdate(
				this._awareness,
				allKnownClientIds,
			);
			const message: BroadcastChannelMessage = {
				type: "awareness-update",
				payload: update,
			};
			this._bc.postMessage(message);
			return;
		}
		if (message.type === "awareness-update" && this._awareness) {
			awarenessProtocol.applyAwarenessUpdate(
				this._awareness,
				message.payload,
				this._internalOrigin,
			);
			return;
		}

		console.error(`Unreachable code, BroadcastChannel message:`, {
			message,
			updateCallback: this._updateCallback,
			awareness: this._awareness,
		});
		return;
	};

	private _handleAwarenessUpdate = (
		{
			added,
			updated,
			removed,
		}: {
			added: number[];
			updated: number[];
			removed: number[];
		},
		origin: unknown,
	) => {
		console.log(origin);
		if (!this._awareness) {
			throw new Error("Awareness was not initialized");
		}
		if (origin === this._internalOrigin) return;
		const changedClients = added.concat(updated).concat(removed);
		const update = awarenessProtocol.encodeAwarenessUpdate(
			this._awareness,
			changedClients,
		);
		const message = {
			type: "awareness-update",
			payload: update,
		};
		this._bc.postMessage(message);
	};

	async destroy(): Promise<void> {
		if (this._destroyed) return;
		this._destroyed = true;
		this._updateCallback = null;
		if (this._awareness) {
			awarenessProtocol.removeAwarenessStates(
				this._awareness,
				[this._awareness.clientID],
				this._internalOrigin,
			);
			this._awareness.off("update", this._handleAwarenessUpdate);
		}
		this._bc.close();
	}
}
