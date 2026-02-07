import type { Awareness } from "y-protocols/awareness.js";
import type * as Y from "yjs";

export interface UpdateHandler {
	init(doc: Y.Doc): Promise<void>;
	persistUpdate(update: Uint8Array): Promise<void>;
	broadcastUpdate(update: Uint8Array): Promise<void>;
	destroy(): Promise<void>;
}

export interface AwarenessHandler {
	registerAwareness(awareness: Awareness): void;
}
