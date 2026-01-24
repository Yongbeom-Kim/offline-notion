import {
	Button,
	CircularProgress,
	DialogActions,
	DialogContent,
	DialogTitle,
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
import { Folder, Home } from "lucide-react";
import { useState } from "react";
import {
	moveNode,
	NodeType,
	ROOT_PARENT_ID,
	useGetNodeChildren,
	useGetRootNodes,
	type NodeMetadata,
} from "@/db/metadata";

interface MoveNodeDialogProps {
	open: boolean;
	onClose: () => void;
	nodeToMove: NodeMetadata;
}

export const MoveNodeDialog = ({
	open,
	onClose,
	nodeToMove,
}: MoveNodeDialogProps) => {
	const [selectedParentId, setSelectedParentId] = useState<string>(ROOT_PARENT_ID);
	const [isMoving, setIsMoving] = useState(false);
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

	const handleMove = async () => {
		if (selectedParentId === nodeToMove.parentId) {
			onClose();
			return;
		}

		setIsMoving(true);
		try {
			await moveNode(nodeToMove.id, selectedParentId);
			onClose();
		} catch (error) {
			console.error("Failed to move node:", error);
		} finally {
			setIsMoving(false);
		}
	};

	const handleClose = () => {
		if (!isMoving) {
			setSelectedParentId(ROOT_PARENT_ID);
			setExpandedFolders(new Set());
			onClose();
		}
	};

	const toggleFolder = (folderId: string) => {
		setExpandedFolders((prev) => {
			const next = new Set(prev);
			if (next.has(folderId)) {
				next.delete(folderId);
			} else {
				next.add(folderId);
			}
			return next;
		});
	};

	return (
		<Modal open={open} onClose={handleClose}>
			<ModalDialog sx={{ width: 400, maxWidth: "90vw" }}>
				<DialogTitle>
					<Typography level="title-lg">
						Move "{nodeToMove.title}"
					</Typography>
				</DialogTitle>
				<DialogContent>
					<Typography level="body-sm" sx={{ mb: 2 }}>
						Select a destination folder:
					</Typography>
					<List
						sx={{
							maxHeight: 300,
							overflow: "auto",
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "sm",
						}}
					>
						{/* Root option */}
						<ListItem>
							<ListItemButton
								selected={selectedParentId === ROOT_PARENT_ID}
								onClick={() => setSelectedParentId(ROOT_PARENT_ID)}
							>
								<ListItemDecorator>
									<Home size={18} />
								</ListItemDecorator>
								<ListItemContent>
									<Typography level="title-sm">Root (no folder)</Typography>
								</ListItemContent>
							</ListItemButton>
						</ListItem>

						{/* Folder tree */}
						<FolderList
							nodeToMove={nodeToMove}
							selectedParentId={selectedParentId}
							setSelectedParentId={setSelectedParentId}
							expandedFolders={expandedFolders}
							toggleFolder={toggleFolder}
						/>
					</List>
				</DialogContent>
				<DialogActions sx={{ flexDirection: "row", justifyContent: "end" }}>
					<Button onClick={handleClose} disabled={isMoving} variant="soft">
						Cancel
					</Button>
					<Button
						onClick={handleMove}
						loading={isMoving}
						disabled={selectedParentId === nodeToMove.parentId}
					>
						Move here
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
};

interface FolderListProps {
	nodeToMove: NodeMetadata;
	selectedParentId: string;
	setSelectedParentId: (id: string) => void;
	expandedFolders: Set<string>;
	toggleFolder: (id: string) => void;
	parentId?: string;
	depth?: number;
}

const FolderList = ({
	nodeToMove,
	selectedParentId,
	setSelectedParentId,
	expandedFolders,
	toggleFolder,
	parentId,
	depth = 0,
}: FolderListProps) => {
	const { rootNodes, isLoading: isLoadingRoot } = useGetRootNodes();
	const { children, isLoading: isLoadingChildren } = useGetNodeChildren(parentId ?? null);

	const isLoading = parentId ? isLoadingChildren : isLoadingRoot;
	const nodes = parentId ? children : ((rootNodes ?? {})[NodeType.Folder] ?? []);

	if (isLoading) {
		return (
			<ListItem sx={{ pl: depth * 2 + 2 }}>
				<CircularProgress size="sm" />
			</ListItem>
		);
	}

	// 
	const folders = (nodes ?? []).filter(
		(node) => node.type === NodeType.Folder && node.id !== nodeToMove.id,
	);

	if (folders.length === 0) {
		return null;
	}

	return (
		<>
			{folders.map((folder) => {
				// const isExpanded = expandedFolders.has(folder.id);
				const isExpanded = true;
				const hasChildren = folder.childrenIds.some(
					(childId) => childId !== nodeToMove.id,
				);

				return (
					<div key={folder.id}>
						<ListItem sx={{ ml: depth * 2 }}>
							<ListItemButton
								selected={selectedParentId === folder.id}
								onClick={() => setSelectedParentId(folder.id)}
							>
								<ListItemDecorator>
									<Folder size={18} />
								</ListItemDecorator>
								<ListItemContent>
									<Typography level="title-sm">{folder.title}</Typography>
								</ListItemContent>
								{hasChildren && (
									<Button
										variant="plain"
										size="sm"
										color="neutral"
										onClick={(e) => {
											e.stopPropagation();
											toggleFolder(folder.id);
										}}
										sx={{ minWidth: 24, p: 0 }}
									>
										<Typography level="body-xs">
											{isExpanded ? "−" : "+"}
										</Typography>
									</Button>
								)}
							</ListItemButton>
						</ListItem>

						{isExpanded && hasChildren && (
							<FolderList
								nodeToMove={nodeToMove}
								selectedParentId={selectedParentId}
								setSelectedParentId={setSelectedParentId}
								expandedFolders={expandedFolders}
								toggleFolder={toggleFolder}
								parentId={folder.id}
								depth={depth + 1}
							/>
						)}
					</div>
				);
			})}
		</>
	);
};

