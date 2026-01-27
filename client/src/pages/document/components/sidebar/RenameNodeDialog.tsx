import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Input,
	Modal,
	ModalDialog,
	Typography,
} from "@mui/joy";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { type NodeMetadata, updateNodeTitle } from "@/integrations/db/metadata";

interface RenameNodeDialogProps {
	open: boolean;
	onClose: () => void;
	node: NodeMetadata;
}

export const RenameNodeDialog = ({
	open,
	onClose,
	node,
}: RenameNodeDialogProps) => {
	const [newTitle, setNewTitle] = useState(node.title);
	const [isRenaming, setIsRenaming] = useState(false);

	const handleRename = async () => {
		const trimmed = newTitle.trim();
		if (!trimmed || trimmed === node.title) {
			onClose();
			return;
		}

		setIsRenaming(true);
		try {
			await updateNodeTitle(node.id, trimmed);
			onClose();
		} catch (error) {
			console.error("Failed to rename:", error);
		} finally {
			setIsRenaming(false);
		}
	};

	const handleClose = () => {
		if (!isRenaming) {
			setNewTitle(node.title);
			onClose();
		}
	};

	return (
		<Modal open={open} onClose={handleClose}>
			<ModalDialog sx={{ width: 400, maxWidth: "90vw" }}>
				<DialogTitle>
					<Typography level="title-lg" startDecorator={<Pencil size={20} />}>
						Rename
					</Typography>
				</DialogTitle>
				<DialogContent>
					<Input
						autoFocus
						placeholder="Enter new name"
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						disabled={isRenaming}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleRename();
							}
						}}
					/>
				</DialogContent>
				<DialogActions sx={{ flexDirection: "row", justifyContent: "end" }}>
					<Button onClick={handleClose} disabled={isRenaming} variant="soft">
						Cancel
					</Button>
					<Button
						onClick={handleRename}
						loading={isRenaming}
						disabled={!newTitle.trim() || newTitle.trim() === node.title}
					>
						Rename
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
};
