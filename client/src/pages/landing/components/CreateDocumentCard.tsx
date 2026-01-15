import {
	Button,
	Card,
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
import { useDocumentStore } from "@/hooks/use-document-store";

export const CreateDocumentComponent = () => {
	const [newTitle, setNewTitle] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const { createDocument } = useDocumentStore();

	const handleCreate = async () => {
		console.log(await createDocument(newTitle));
		setNewTitle("");
		setIsCreateOpen(false);
	};

	return (
		<>
			<Card variant="soft" sx={{ p: 3 }}>
				<Stack spacing={2}>
					<Typography level="title-md">Start a new document</Typography>
					<Button
						startDecorator={<Plus size={16} />}
						onClick={() => {
							setNewTitle("");
							setIsCreateOpen(true);
						}}
						sx={{ alignSelf: "flex-start" }}
					>
						Create document
					</Button>
				</Stack>
			</Card>

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
					<DialogActions
						sx={{
							flexDirection: "row",
							justifyContent: "end",
						}}
					>
						<Button onClick={handleCreate}>Create</Button>
						<Button variant="soft" onClick={() => setIsCreateOpen(false)}>
							Cancel
						</Button>
					</DialogActions>
				</ModalDialog>
			</Modal>
		</>
	);
};
