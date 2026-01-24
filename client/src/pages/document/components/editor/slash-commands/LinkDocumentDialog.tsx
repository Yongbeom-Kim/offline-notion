import {
	Avatar,
	CircularProgress,
	DialogActions,
	DialogContent,
	DialogTitle,
	Input,
	List,
	ListItem,
	ListItemButton,
	ListItemContent,
	ListItemDecorator,
	Modal,
	ModalDialog,
	Stack,
	Typography,
} from "@mui/joy";
import { FileText, Search } from "lucide-react";
import { useState } from "react";
import { type NodeMetadata, useGetAllActiveDocuments } from "@/db/metadata";

interface LinkDocumentDialogProps {
	open: boolean;
	onClose: () => void;
	onDocumentSelected: (docId: string, title: string) => void;
}

export const LinkDocumentDialog = ({
	open,
	onClose,
	onDocumentSelected,
}: LinkDocumentDialogProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const { documents, isLoading } = useGetAllActiveDocuments();

	const filteredDocuments = !searchQuery.trim()
		? (documents ?? [])
		: (documents ?? []).filter((doc) =>
				doc.title.toLowerCase().includes(searchQuery.toLowerCase()),
			);

	const handleSelectDocument = (doc: NodeMetadata) => {
		onDocumentSelected(doc.id, doc.title);
		setSearchQuery("");
		onClose();
	};

	const handleClose = () => {
		setSearchQuery("");
		onClose();
	};

	return (
		<Modal open={open} onClose={handleClose}>
			<ModalDialog sx={{ width: 500, maxWidth: "90vw" }}>
				<DialogTitle>
					<Stack direction="row" spacing={1} alignItems="center">
						<FileText size={20} />
						<Typography level="title-lg">Link to document</Typography>
					</Stack>
				</DialogTitle>
				<DialogContent>
					<Stack spacing={2}>
						<Input
							placeholder="Search documents..."
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							startDecorator={<Search size={16} />}
							autoFocus
						/>

						{isLoading ? (
							<Stack spacing={1} alignItems="center" sx={{ py: 4 }}>
								<CircularProgress />
								<Typography level="body-sm" textColor="text.secondary">
									Loading documents...
								</Typography>
							</Stack>
						) : filteredDocuments.length === 0 ? (
							documents?.length ? (
								<Stack spacing={1} alignItems="center" sx={{ py: 4 }}>
									<FileText size={48} opacity={0.5} />
									<Typography level="title-md">No documents yet</Typography>
									<Typography level="body-sm" textColor="text.secondary">
										Create your first document to start linking to it.
									</Typography>
								</Stack>
							) : (
								<Stack spacing={1} alignItems="center" sx={{ py: 4 }}>
									<Search size={48} opacity={0.5} />
									<Typography level="title-md">No matches found</Typography>
									<Typography level="body-sm" textColor="text.secondary">
										Try a different search term.
									</Typography>
								</Stack>
							)
						) : (
							<List sx={{ maxHeight: 300, overflow: "auto" }}>
								{filteredDocuments.map((doc) => (
									<ListItem key={doc.id}>
										<ListItemButton onClick={() => handleSelectDocument(doc)}>
											<ListItemDecorator>
												<Avatar size="sm">
													<FileText size={16} />
												</Avatar>
											</ListItemDecorator>
											<ListItemContent>
												<Typography level="title-sm">{doc.title}</Typography>
												<Typography level="body-xs" textColor="text.secondary">
													Updated {new Date(doc.updatedAt).toLocaleString()}
												</Typography>
											</ListItemContent>
										</ListItemButton>
									</ListItem>
								))}
							</List>
						)}
					</Stack>
				</DialogContent>
				<DialogActions
					sx={{
						flexDirection: "row",
						justifyContent: "end",
					}}
				>
					<button
						type="button"
						onClick={handleClose}
						style={{
							border: "none",
							background: "none",
							color: "inherit",
							font: "inherit",
							cursor: "pointer",
							padding: "8px 16px",
							borderRadius: "4px",
						}}
					>
						Cancel
					</button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
};
