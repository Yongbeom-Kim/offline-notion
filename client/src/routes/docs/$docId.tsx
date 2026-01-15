import { createFileRoute } from "@tanstack/react-router";
import { DocumentPage } from "@/pages/document/DocumentPage";

export const Route = createFileRoute("/docs/$docId")({
	component: DocumentRoute,
});

function DocumentRoute() {
	const { docId } = Route.useParams();
	console.log({ docId });
	return <DocumentPage docId={docId} />;
}
