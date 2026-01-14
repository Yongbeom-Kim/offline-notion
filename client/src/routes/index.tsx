import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	Divider,
	IconButton,
	Input,
	Modal,
	ModalDialog,
	Stack,
	Typography,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/joy";
import { Plus, RefreshCcw, Trash2, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	createDocument,
	deleteDocument,
	listDocuments,
	updateDocument,
	type DocumentRecord,
} from "../data/documents";

export const Route = createFileRoute("/")({ component: DocumentsLanding });

function formatDate(timestamp: number) {
	return new Date(timestamp).toLocaleString();
}

function DocumentsLanding() {
	const [documents, setDocuments] = useState<DocumentRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [newTitle, setNewTitle] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingTitle, setEditingTitle] = useState("");
	const hasDocuments = documents.length > 0;

	const reload = async () => {
		setIsLoading(true);
		try {
			const items = await listDocuments();
			setDocuments(items);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		void reload();
	}, []);

	const handleCreate = async () => {
		const created = await createDocument(newTitle);
		setNewTitle("");
		setIsCreateOpen(false);
		setDocuments((prev) => [created, ...prev]);
	};

	const handleDelete = async (documentId: string) => {
		await deleteDocument(documentId);
		setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
		if (editingId === documentId) {
			setEditingId(null);
			setEditingTitle("");
		}
	};

	const beginEdit = (doc: DocumentRecord) => {
		setEditingId(doc.id);
		setEditingTitle(doc.title);
	};

	const handleSaveTitle = async (documentId: string) => {
		const trimmed = editingTitle.trim() || "Untitled document";
		const updated = await updateDocument(documentId, { title: trimmed });
		if (updated) {
			setDocuments((prev) =>
				prev.map((doc) => (doc.id === documentId ? updated : doc)),
			);
		}
		setEditingId(null);
		setEditingTitle("");
	};

	const summaryLabel = useMemo(() => {
		if (isLoading) {
			return "Loading documents";
		}
		return hasDocuments
			? `${documents.length} documents saved locally`
			: "No documents yet";
	}, [documents.length, hasDocuments, isLoading]);

	return (
		<Box
			sx={{
				minHeight: "calc(100vh - 64px)",
				px: { xs: 3, md: 6 },
				py: 4,
				bgcolor: "background.body",
			}}
		>
			<Stack spacing={3}>
				<Stack spacing={1}>
					<Typography level="h1">Your offline workspace</Typography>
					<Typography level="body-lg" textColor="text.secondary">
						Create and manage local-only documents stored in IndexedDB.
					</Typography>
				</Stack>

				<Card variant="soft" sx={{ p: 3 }}>
					<Stack spacing={2}>
						<Typography level="title-md">
							Start a new document
						</Typography>
						<Button
							startDecorator={<Plus size={16} />}
							onClick={() => {
								setNewTitle("");
								setIsCreateOpen(true);
							}}
							disabled={isLoading}
							sx={{ alignSelf: "flex-start" }}
						>
							Create document
						</Button>
					</Stack>
				</Card>

				<Card variant="outlined" sx={{ p: 3 }}>
					<Stack direction="row" justifyContent="space-between">
						<Typography level="title-md">All documents</Typography>
						<Stack direction="row" spacing={1} alignItems="center">
							<Chip variant="soft" color="primary">
								{summaryLabel}
							</Chip>
							<IconButton
								variant="plain"
								size="sm"
								onClick={reload}
								disabled={isLoading}
								aria-label="Refresh documents"
							>
								<RefreshCcw size={16} />
							</IconButton>
						</Stack>
					</Stack>
					<Divider sx={{ my: 2 }} />

					{!hasDocuments && !isLoading ? (
						<Stack spacing={1} alignItems="flex-start">
							<Typography level="body-md">
								You have no documents yet.
							</Typography>
							<Typography level="body-sm" textColor="text.secondary">
								Create your first document to start writing.
							</Typography>
						</Stack>
					) : (
						<Stack spacing={2}>
							{documents.map((doc) => (
								<Card key={doc.id} variant="soft">
									<CardContent>
										<Stack spacing={1}>
											{editingId === doc.id ? (
												<Input
													value={editingTitle}
													onChange={(event) =>
														setEditingTitle(event.target.value)
													}
												/>
											) : (
												<Typography level="title-md">
													{doc.title}
												</Typography>
											)}
											<Typography level="body-sm" textColor="text.secondary">
												Last updated {formatDate(doc.updatedAt)}
											</Typography>
										</Stack>
									</CardContent>
									<CardActions>
										<Stack
											direction={{ xs: "column", sm: "row" }}
											spacing={1}
											sx={{ width: "100%" }}
										>
											<Button
												component={Link}
												to="/docs/$docId"
												params={{ docId: doc.id }}
												variant="solid"
												size="sm"
												sx={{ flex: { sm: 1 } }}
											>
												Open
											</Button>
											{editingId === doc.id ? (
												<Button
													variant="soft"
													size="sm"
													onClick={() => handleSaveTitle(doc.id)}
												>
													Save title
												</Button>
											) : (
												<Button
													variant="soft"
													size="sm"
													startDecorator={<Pencil size={14} />}
													onClick={() => beginEdit(doc)}
												>
													Rename
												</Button>
											)}
											<IconButton
												color="danger"
												variant="soft"
												size="sm"
												onClick={() => handleDelete(doc.id)}
												aria-label={`Delete ${doc.title}`}
											>
												<Trash2 size={14} />
											</IconButton>
										</Stack>
									</CardActions>
								</Card>
							))}
						</Stack>
					)}
				</Card>
			</Stack>
			<Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
				<ModalDialog>
					<DialogTitle>Create a document</DialogTitle>
					<DialogContent>
						<Input
							autoFocus
							placeholder="Give it a title"
							value={newTitle}
							onChange={(event) => setNewTitle(event.target.value)}
						/>
					</DialogContent>
					<DialogActions>
						<Button
							variant="soft"
							onClick={() => setIsCreateOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleCreate} disabled={isLoading}>
							Create
						</Button>
					</DialogActions>
				</ModalDialog>
			</Modal>
		</Box>
	);
}
