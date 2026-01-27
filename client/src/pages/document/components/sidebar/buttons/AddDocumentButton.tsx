import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { createNode, NodeType } from "@/integrations/db/metadata";
import { useSidebarEdit } from "../SidebarEditContext";
import { BaseSidebarButton } from "./BaseSidebarButton";

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
		<BaseSidebarButton
			onClick={handleCreateDocument}
			isLoading={isCreating}
			buttonStartDecorator={<Plus size={16} />}
			buttonText="Add document"
		/>
	);
};
