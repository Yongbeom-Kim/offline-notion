import { Button, Typography } from "@mui/joy";
import { FolderPlus } from "lucide-react";
import { useState } from "react";
import { createNode, NodeType } from "@/integrations/db/metadata";
import { useSidebarEdit } from "../SidebarEditContext";

export const AddFolderButton = () => {
	const [isCreating, setIsCreating] = useState(false);
	const { setEditingNodeId } = useSidebarEdit();

	const handleCreateFolder = async () => {
		setIsCreating(true);
		try {
			const folderId = await createNode("New Folder", NodeType.Folder);
			setEditingNodeId(folderId);
		} catch (error) {
			console.error("Failed to create folder:", error);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Button
			onClick={handleCreateFolder}
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
			startDecorator={<FolderPlus size={16} />}
		>
			<Typography
				level="body-sm"
				sx={{
					color: "text.tertiary",
					fontWeight: 400,
				}}
			>
				Add folder
			</Typography>
		</Button>
	);
};
