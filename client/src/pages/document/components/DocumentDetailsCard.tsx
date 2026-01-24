import { Button, Card, Input, Stack, Typography } from "@mui/joy";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteNote, type NodeMetadata, updateNodeTitle } from "@/db/metadata";

type DocumentDetailsCardProps = {
	document: NodeMetadata | null;
	isLoading: boolean;
};

export const DocumentDetailsCard = ({
	document,
	isLoading,
}: DocumentDetailsCardProps) => {
	const [title, setTitle] = useState(document?.title ?? "");
	const hasDocument = !!document;

	useEffect(() => {
		setTitle(document?.title ?? "");
	}, [document]);

	const handleSaveTitle = async () => {
		if (!document) {
			return;
		}
		const trimmed = title.trim() || "Untitled document";
		const updated = await updateNodeTitle(document.id, trimmed);
		if (updated) {
			setTitle(updated.title);
		}
	};

	const handleDelete = async () => {
		if (!document) {
			return;
		}
		await deleteNote(document.id);
		window.location.assign("/");
	};

	return (
		<Card variant="outlined" sx={{ p: 3 }}>
			<Stack spacing={2}>
				<Typography level="title-md">Document details</Typography>
				<Input
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					placeholder="Document title"
					disabled={isLoading || !hasDocument}
				/>
				<Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
					<Button
						onClick={handleSaveTitle}
						disabled={isLoading || !hasDocument}
					>
						Save title
					</Button>
					<Button
						variant="soft"
						color="danger"
						startDecorator={<Trash2 size={16} />}
						onClick={handleDelete}
						disabled={isLoading || !hasDocument}
					>
						Delete document
					</Button>
				</Stack>
			</Stack>
		</Card>
	);
};
