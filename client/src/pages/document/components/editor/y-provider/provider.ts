import { Dexie } from "dexie";
import { ObservableV2 } from "lib0/observable";
import * as Y from "yjs";
import { type Debounced, debounce } from "@/utils/debounce";
import { deepMerge } from "@/utils/merge";

type DexieDb = Dexie & {
	updates: Dexie.Table<Uint8Array, number>;
	// biome-ignore lint/suspicious/noExplicitAny: This is legacy carried over from y-indexeddb, but we don't use it.
	custom: Dexie.Table<any, any>;
};

type BroadcastChannelMessage = {
	type: "update";
	payload: Uint8Array;
};

type ProviderOptions = {
	compactAfter: {
		debounceTime: number;
		maxLogCount: number;
	};
};

const defaultOptions: ProviderOptions = {
	compactAfter: {
		debounceTime: 5000, // milliseconds
		maxLogCount: 1000,
	},
};

export class OfflineNotionProvider extends ObservableV2<{
	synced: () => void;
	error: (error: Error) => void;
}> {
	private _db: DexieDb;
	private _bc: BroadcastChannel;
	private _updateCount: number; // Doesn't need to be accurate, just used for compaction.
	private _destroyed: boolean;
	docId: string;
	doc: Y.Doc;
	options: ProviderOptions;
	private _debouncedCompactUpdates: Debounced<() => Promise<void>>;

	constructor(
		docId: string,
		doc: Y.Doc,
		options: Partial<ProviderOptions> = {},
	) {
		super();
		this.docId = docId;
		this.doc = doc;
		this._db = new Dexie(docId) as DexieDb;
		this._bc = new BroadcastChannel(docId);
		this._updateCount = 0;
		this.options = deepMerge(defaultOptions, options);
		this._destroyed = false;

		this._db.version(0.1).stores({
			custom: "",
			updates: "++",
		});

		this.doc.on("update", this.handleDocUpdate);
		this.on("error", () => this.destroy());
		this._bc.onmessage = this.handleBroadcastChannelMessage;

		this._debouncedCompactUpdates = debounce(
			() => this._compactUpdates(),
			this.options.compactAfter.debounceTime,
		);
		this.init();
	}

	async init() {
		try {
			const updates = await this._db.updates.toArray();

			if (updates.length > 0) {
				const mergedUpdate = Y.mergeUpdates(updates);
				Y.applyUpdate(this.doc, mergedUpdate, this);
			}

			this.emit("synced", []);
		} catch (err) {
			this.emit("error", [err instanceof Error ? err : new Error(String(err))]);
		}
	}

	handleDocUpdate = async (
		update: Uint8Array,
		origin: unknown,
		_doc: Y.Doc,
		_tr: Y.Transaction,
	) => {
		if (origin === this) return;
		this._updateCount++;
		await this._writeUpdateToIndexedDb(update);
		this._writeUpdateToBroadcastChannel(update);
		this._debouncedCompactUpdates();
		if (this._updateCount > this.options.compactAfter.maxLogCount) {
			this._debouncedCompactUpdates.cancel();
			this._compactUpdates();
		}
	};

	handleBroadcastChannelMessage = (
		ev: MessageEvent<BroadcastChannelMessage>,
	) => {
		const message = ev.data;
		if (message.type !== "update")
			throw new Error(`Unreachable code, BroadcastChannel message: ${message}`);
		const update = message.payload;
		this._writeUpdateToDoc(update);
	};

	async _writeUpdateToIndexedDb(update: Uint8Array) {
		try {
			await this._db.updates.add(update);
		} catch (err) {
			this.emit("error", [err instanceof Error ? err : new Error(String(err))]);
		}
	}

	_writeUpdateToBroadcastChannel(update: Uint8Array) {
		const message: BroadcastChannelMessage = {
			type: "update",
			payload: update,
		};
		this._bc.postMessage(message);
	}

	_writeUpdateToDoc(update: Uint8Array) {
		Y.applyUpdate(this.doc, update, this);
	}

	async _compactUpdates() {
		try {
			await this._db.transaction("rw", this._db.updates, async () => {
				const updates = await this._db.updates.toArray();
				const mergedUpdate = Y.mergeUpdates(updates);
				await this._db.updates.clear();
				await this._db.updates.add(mergedUpdate);
				this._updateCount = 1;
			});
		} catch (err) {
			this.emit("error", [err instanceof Error ? err : new Error(String(err))]);
		}
	}

	destroy(): void {
		if (this._destroyed) return;
		this.doc.off("update", this.handleDocUpdate);
		this._debouncedCompactUpdates.cancel();
		// this._db.close();
		this._bc.close();
	}
}
