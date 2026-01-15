import {
	Button,
	Card,
	CardActions,
	CardContent,
	CircularProgress,
	IconButton,
	Input,
	Stack,
	Typography,
} from "@mui/joy";
import { Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	type DocumentMetadata,
	useDocumentStore,
} from "@/hooks/use-document-store";

type DocumentListCardBodyProps = {
	documentList: DocumentMetadata[];
	isLoading: boolean;
	editingId: string | null;
	setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
};

export const DocumentListCardBody = ({
	documentList,
	isLoading,
	editingId,
	setEditingId,
}: DocumentListCardBodyProps) => {
	const [editingTitle, setEditingTitle] = useState("");
	const { updateDocument, deleteDocument } = useDocumentStore();

	if (isLoading) {
		return (
			<Stack spacing={1} alignItems="center" sx={{ py: 4 }}>
				<CircularProgress />
			</Stack>
		);
	}

	if (documentList.length === 0) {
		return (
			<Stack spacing={1} alignItems="flex-start">
				<Typography level="body-md">You have no documents yet.</Typography>
				<Typography level="body-sm" textColor="text.secondary">
					Create your first document to start writing.
				</Typography>
			</Stack>
		);
	}

	const handleUpdateTitle = (doc: DocumentMetadata) => {
		updateDocument(doc.id, {
			title: editingTitle,
		});
		setEditingId(null);
	};

	const handleTitleKeyDown = (
		event: React.KeyboardEvent<HTMLInputElement>,
		doc: DocumentMetadata,
	) => {
		if (event.key === "Enter") {
			handleUpdateTitle(doc);
		}
	};

	return (
		<Stack spacing={2}>
			{documentList.map((doc) => (
				<Card key={doc.id} variant="soft">
					<CardContent>
						<Stack spacing={1}>
							{editingId === doc.id ? (
								<Input
									value={editingTitle}
									onChange={(event) => setEditingTitle(event.target.value)}
									onKeyDown={(event) => handleTitleKeyDown(event, doc)}
								/>
							) : (
								<Typography level="title-md">{doc.title}</Typography>
							)}
							<Typography level="body-sm" textColor="text.secondary">
								Last updated {new Date(doc.updatedAt).toLocaleString()}
							</Typography>
						</Stack>
					</CardContent>
					<CardActions>
						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={1}
							sx={{ width: "100%" }}
						>
							<Link
								to="/docs/$docId"
								params={{ docId: doc.id }}
								style={{ textDecoration: "none" }}
							>
								<Button variant="solid" size="sm" sx={{ flex: { sm: 1 } }}>
									Open
								</Button>
							</Link>
							{editingId === doc.id ? (
								<Button
									variant="soft"
									size="sm"
									onClick={() => handleUpdateTitle(doc)}
								>
									Save title
								</Button>
							) : (
								<Button
									variant="soft"
									size="sm"
									startDecorator={<Pencil size={14} />}
									onClick={() => setEditingId(doc.id)}
								>
									Rename
								</Button>
							)}
							<IconButton
								color="danger"
								variant="soft"
								size="sm"
								onClick={() => deleteDocument(doc.id)}
								aria-label={`Delete ${doc.title}`}
							>
								<Trash2 size={14} />
							</IconButton>
						</Stack>
					</CardActions>
				</Card>
			))}
		</Stack>
	);
};
