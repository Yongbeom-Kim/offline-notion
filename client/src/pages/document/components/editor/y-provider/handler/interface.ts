import type * as Y from "yjs";

export interface UpdateHandler {
	init(doc: Y.Doc): Promise<void>;
	persistUpdate(update: Uint8Array): Promise<void>;
	broadcastUpdate(update: Uint8Array): Promise<void>;
	onUpdateReceived(callback: (update: Uint8Array) => void): void;
	destroy(): Promise<void>;
}
