import { FolderPlus } from "lucide-react";
import { useState } from "react";
import { createNode, NodeType } from "@/integrations/db/metadata";
import { useSidebarEdit } from "../SidebarEditContext";
import { BaseSidebarButton } from "./BaseSidebarButton";

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
		<BaseSidebarButton
			onClick={handleCreateFolder}
			isLoading={isCreating}
			buttonStartDecorator={<FolderPlus size={16} />}
			buttonText="Add folder"
		/>
	);
};
