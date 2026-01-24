import { Button, Typography } from "@mui/joy";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { createNode, NodeType } from "@/db/metadata";
import { useSidebarEdit } from "./SidebarEditContext";

export const AddDocumentButton = () => {
	const [isCreating, setIsCreating] = useState(false);
	const navigate = useNavigate();
	const { setEditingNodeId } = useSidebarEdit();

	const handleCreateDocument = async () => {
		setIsCreating(true);
		try {
			const docId = await createNode("Untitled document", NodeType.Document);
			setEditingNodeId(docId);
			navigate({ to: "/docs/$docId", params: { docId } });
		} catch (error) {
			console.error("Failed to create document:", error);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Button
			onClick={handleCreateDocument}
			variant="plain"
			color="neutral"
			loading={isCreating}
			sx={{
				justifyContent: "flex-start",
				pl: 2,
				pr: 2,
				py: 1,
				minHeight: "32px",
				borderRadius: "4px",
				"&:hover": {
					bgcolor: "background.level1",
				},
				"&:disabled": {
					color: "text.tertiary",
				},
			}}
			startDecorator={<Plus size={16} />}
		>
			<Typography
				level="body-sm"
				sx={{
					color: "text.tertiary",
					fontWeight: 400,
				}}
			>
				Add document
			</Typography>
		</Button>
	);
};
