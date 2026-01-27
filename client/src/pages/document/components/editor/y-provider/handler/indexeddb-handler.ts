import { Dexie } from "dexie";
import * as Y from "yjs";
import { type Debounced, debounce } from "@/utils/debounce";
import { deepMerge } from "@/utils/merge";
import type { UpdateHandler } from "./interface";

type DexieDb = Dexie & {
	updates: Dexie.Table<Uint8Array, number>;
	// biome-ignore lint/suspicious/noExplicitAny: This is legacy carried over from y-indexeddb, but we don't use it.
	custom: Dexie.Table<any, any>;
};

type Options = {
	compactAfter: {
		debounceTime: number;
		maxLogCount: number;
	};
};

const defaultOptions: Options = {
	compactAfter: {
		debounceTime: 5000, // milliseconds
		maxLogCount: 1000,
	},
};

export class IndexedDbHandler implements UpdateHandler {
	private _db: DexieDb;
	private _updateCount: number; // Doesn't need to be accurate, just used for compaction.
	private _debouncedCompactUpdates: Debounced<() => Promise<void>>;
	private _internalOrigin: symbol;

	docId: string;
	options: Options;

	constructor(
		docId: string,
		internalOrigin: symbol,
		options: Partial<Options> = {},
	) {
		this.docId = docId;
		this._db = new Dexie(docId) as DexieDb;
		this._db.version(0.1).stores({
			custom: "",
			updates: "++",
		});
		this._internalOrigin = internalOrigin;
		this.options = deepMerge(defaultOptions, options);
		this._updateCount = 0;
		this._debouncedCompactUpdates = debounce(
			() => this._compactUpdates(),
			this.options.compactAfter.debounceTime,
		);
	}

	async init(doc: Y.Doc): Promise<void> {
		const updates = await this._db.updates.toArray();

		if (updates.length > 0) {
			this._updateCount = updates.length;
			const mergedUpdate = Y.mergeUpdates(updates);
			Y.applyUpdate(doc, mergedUpdate, this._internalOrigin);
		}
	}

	async persistUpdate(update: Uint8Array): Promise<void> {
		this._updateCount++;
		await this._db.updates.add(update);
		if (this._updateCount > this.options.compactAfter.maxLogCount) {
			this._debouncedCompactUpdates.cancel();
			await this._compactUpdates();
		} else {
			this._debouncedCompactUpdates();
		}
	}

	async broadcastUpdate(_update: Uint8Array): Promise<void> {
		// noop
		return;
	}

	onUpdateReceived(_callback: (update: Uint8Array) => void): void {
		// noop
		return;
	}

	async destroy(): Promise<void> {
		// This gives you issues when you refresh the page.
		// this._db.close();
		this._debouncedCompactUpdates.cancel();
		return;
	}

	async _compactUpdates() {
		await this._db.transaction("rw", this._db.updates, async () => {
			const updates = await this._db.updates.toArray();
			const mergedUpdate = Y.mergeUpdates(updates);
			await this._db.updates.clear();
			await this._db.updates.add(mergedUpdate);
			this._updateCount = 1;
		});
	}
}
