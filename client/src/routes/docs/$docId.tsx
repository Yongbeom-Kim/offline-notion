import { createFileRoute } from "@tanstack/react-router";
import { DocumentPage } from "@/pages/document/DocumentPage";
import { DocumentPageLayout } from "@/pages/document/layout/DocumentPageLayout";

export const Route = createFileRoute("/docs/$docId")({
	component: DocumentRoute,
});

function DocumentRoute() {
	return (
		<DocumentPageLayout>
			<DocumentPage />
		</DocumentPageLayout>
	);
}
