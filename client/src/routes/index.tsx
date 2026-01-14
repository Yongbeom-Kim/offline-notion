import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { BlockNoteEditor } from "../components/editor/BlockNoteEditor";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<ClientOnly>
			<BlockNoteEditor />
		</ClientOnly>
	);
}
