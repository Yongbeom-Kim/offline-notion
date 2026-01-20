import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Input,
	Modal,
	ModalDialog,
	Stack,
	Typography,
} from "@mui/joy";
import { Plus } from "lucide-react";
import { useState } from "react";
import { createDocumentMetadata } from "@/hooks/use-document-store";

interface CreateDocumentDialogProps {
	open: boolean;
	onClose: () => void;
	onDocumentCreated: (docId: string, title: string) => void;
}

export const CreateDocumentDialog = ({
	open,
	onClose,
	onDocumentCreated,
}: CreateDocumentDialogProps) => {
	const [newTitle, setNewTitle] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const handleCreate = async () => {
		if (!newTitle.trim()) return;

		setIsCreating(true);
		try {
			const docId = await createDocumentMetadata(newTitle);
			onDocumentCreated(docId, newTitle.trim());

			const url = `${window.location.origin}/docs/${docId}`;
			window.open(url, "_blank");

			setNewTitle("");
			onClose();
		} catch (error) {
			console.error("Failed to create document:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleClose = () => {
		if (!isCreating) {
			setNewTitle("");
			onClose();
		}
	};

	return (
		<Modal open={open} onClose={handleClose}>
			<ModalDialog>
				<DialogTitle>
					<Stack direction="row" spacing={1} alignItems="center">
						<Plus size={20} />
						<Typography level="title-lg">Create new document</Typography>
					</Stack>
				</DialogTitle>
				<DialogContent>
					<Input
						autoFocus
						placeholder="Give it a title"
						value={newTitle}
						onChange={(event) => setNewTitle(event.target.value)}
						disabled={isCreating}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								handleCreate();
							}
						}}
					/>
				</DialogContent>
				<DialogActions
					sx={{
						flexDirection: "row",
						justifyContent: "end",
					}}
				>
					<Button onClick={handleClose} disabled={isCreating} variant="soft">
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						disabled={!newTitle.trim() || isCreating}
						loading={isCreating}
					>
						Create
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
};
