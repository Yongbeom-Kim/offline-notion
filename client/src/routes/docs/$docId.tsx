import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import {
	Box,
	Button,
	Card,
	Divider,
	Input,
	Stack,
	Typography,
} from "@mui/joy";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BlockNoteEditor } from "../../components/editor/BlockNoteEditor";
import {
	deleteDocument,
	getDocument,
	updateDocument,
	type DocumentRecord,
} from "../../data/documents";

export const Route = createFileRoute("/docs/$docId")({
	component: DocumentPage,
});

function DocumentPage() {
	const { docId } = Route.useParams();
	const [document, setDocument] = useState<DocumentRecord | null>(null);
	const [title, setTitle] = useState("");
	const [isMissing, setIsMissing] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			const record = await getDocument(docId);
			if (!isMounted) {
				return;
			}
			if (!record) {
				setIsMissing(true);
				return;
			}
			setDocument(record);
			setTitle(record.title);
		};
		void load();
		return () => {
			isMounted = false;
		};
	}, [docId]);

	const handleSaveTitle = async () => {
		if (!document) {
			return;
		}
		const trimmed = title.trim() || "Untitled document";
		const updated = await updateDocument(document.id, { title: trimmed });
		if (updated) {
			setDocument(updated);
			setTitle(updated.title);
		}
	};

	const handleDelete = async () => {
		if (!document) {
			return;
		}
		await deleteDocument(document.id);
		window.location.assign("/");
	};

	if (isMissing) {
		return (
			<Box sx={{ px: { xs: 3, md: 6 }, py: 6 }}>
				<Card variant="soft" sx={{ p: 4, maxWidth: 560 }}>
					<Stack spacing={2}>
						<Typography level="h2">Document not found</Typography>
						<Typography level="body-md" textColor="text.secondary">
							This document may have been deleted on this device.
						</Typography>
						<Button component={Link} to="/" startDecorator={<ArrowLeft size={16} />}>
							Back to documents
						</Button>
					</Stack>
				</Card>
			</Box>
		);
	}

	return (
		<Box sx={{ px: { xs: 3, md: 6 }, py: 4 }}>
			<Stack spacing={2}>
				<Stack spacing={1}>
					<Button
						variant="plain"
						component={Link}
						to="/"
						startDecorator={<ArrowLeft size={16} />}
						sx={{ alignSelf: "flex-start" }}
					>
						All documents
					</Button>
					<Typography level="h1">Document workspace</Typography>
					<Typography level="body-md" textColor="text.secondary">
						Changes are stored locally in IndexedDB.
					</Typography>
				</Stack>

				<Card variant="outlined" sx={{ p: 3 }}>
					<Stack spacing={2}>
						<Typography level="title-md">Document details</Typography>
						<Input
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							placeholder="Document title"
						/>
						<Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
							<Button onClick={handleSaveTitle}>Save title</Button>
							<Button
								variant="soft"
								color="danger"
								startDecorator={<Trash2 size={16} />}
								onClick={handleDelete}
							>
								Delete document
							</Button>
						</Stack>
					</Stack>
				</Card>

				<Divider />

				<Card variant="soft" sx={{ p: 2, minHeight: 600 }}>
					<ClientOnly>
						{document ? (
							<BlockNoteEditor documentId={document.id} />
						) : (
							<Typography level="body-md">
								Loading editor...
							</Typography>
						)}
					</ClientOnly>
				</Card>
			</Stack>
		</Box>
	);
}
