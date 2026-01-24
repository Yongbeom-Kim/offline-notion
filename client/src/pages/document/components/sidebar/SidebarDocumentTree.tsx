import {
	Box,
	Button,
	CircularProgress,
	Dropdown,
	Menu,
	MenuButton,
	MenuItem,
	Stack,
} from "@mui/joy";
import { useNavigate } from "@tanstack/react-router";
import {
	ChevronDown,
	FileText,
	Folder,
	FolderInput,
	MoreHorizontal,
	Pencil,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	deleteNote,
	type NodeMetadata,
	NodeType,
	useGetNodeChildren,
	useGetRootNodes,
} from "@/db/metadata";
import { useDocumentContext } from "../../context/document-context/DocumentContext";
import { isAncestorOf } from "../../utils/document-hierarchy";
import { MoveNodeDialog } from "./MoveNodeDialog";
import { RenameNodeDialog } from "./RenameNodeDialog";

export const SidebarDocumentTree = () => {
	const { rootNodes, isLoading, error } = useGetRootNodes();

	if (isLoading) {
		return (
			<Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
				<CircularProgress size="sm" />
			</Stack>
		);
	}

	if (error || !rootNodes) {
		return (
			<Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
				<Box sx={{ color: "danger.solidBg" }}>
					Failed to load the document tree.
				</Box>
			</Stack>
		);
	}

	return (
		<Stack
			direction="column"
			spacing={0}
			sx={{
				flex: 1,
				overflowY: "auto",
				minHeight: 0,
			}}
		>
			{rootNodes[NodeType.Folder].map((node) => (
				<SidebarDocumentTreeItem key={node.id} node={node} />
			))}
			{rootNodes[NodeType.Document].map((node) => (
				<SidebarDocumentTreeItem key={node.id} node={node} />
			))}
		</Stack>
	);
};

type SidebarDocumentTreeItemProps = {
	node: NodeMetadata;
};

export const SidebarDocumentTreeItem = ({
	node,
}: SidebarDocumentTreeItemProps) => {
	const { metadata } = useDocumentContext();
	const pageDocId = metadata.data?.id;
	const hasChildren = node.childrenIds.length > 0;
	const [isExpanded, setExpanded] = useState(false);

	// Dialog states
	const [isMoveDialogOpen, setMoveDialogOpen] = useState(false);
	const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);

	// Auto-expand if current page is a descendant of this node
	useEffect(() => {
		if (!pageDocId || !hasChildren) return;

		const checkAncestor = async () => {
			if (node.id === pageDocId) {
				return;
			}
			// TODO: check isAncestorOf
			const isParent = await isAncestorOf(node.id, pageDocId);
			if (isParent) {
				setExpanded(true);
			}
		};

		checkAncestor();
	}, [node.id, pageDocId, hasChildren]);

	return (
		<Stack direction="column" spacing={0}>
			<SideBarDocumentTreeItemButton
				node={node}
				isExpanded={isExpanded}
				setExpanded={setExpanded}
				hasChildren={hasChildren}
				onMoveClick={() => setMoveDialogOpen(true)}
				onRenameClick={() => setRenameDialogOpen(true)}
			/>
			{isExpanded && hasChildren && (
				<SidebarDocumentTreeChildren parentId={node.id} />
			)}

			{isMoveDialogOpen && (
				<MoveNodeDialog
					open={isMoveDialogOpen}
					onClose={() => setMoveDialogOpen(false)}
					nodeToMove={node}
				/>
			)}

			{isRenameDialogOpen && (
				<RenameNodeDialog
					open={isRenameDialogOpen}
					onClose={() => setRenameDialogOpen(false)}
					node={node}
				/>
			)}
		</Stack>
	);
};

type SidebarDocumentTreeChildrenProps = {
	parentId: string;
};

const SidebarDocumentTreeChildren = ({
	parentId,
}: SidebarDocumentTreeChildrenProps) => {
	const { children, isLoading } = useGetNodeChildren(parentId);

	if (isLoading) {
		return (
			<Box sx={{ paddingLeft: "1.5rem", py: 1 }}>
				<CircularProgress size="sm" />
			</Box>
		);
	}

	if (!children || children.length === 0) {
		return null;
	}

	return (
		<Box sx={{ paddingLeft: "1rem" }}>
			{children.map((child) => (
				<SidebarDocumentTreeItem key={child.id} node={child} />
			))}
		</Box>
	);
};

type SideBarDocumentTreeItemButtonProps = {
	node: NodeMetadata;
	isExpanded: boolean;
	setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
	hasChildren: boolean;
	onMoveClick: () => void;
	onRenameClick: () => void;
};

const SideBarDocumentTreeItemButton = ({
	node,
	isExpanded,
	setExpanded,
	hasChildren,
	onMoveClick,
	onRenameClick,
}: SideBarDocumentTreeItemButtonProps) => {
	const navigate = useNavigate();
	const { metadata } = useDocumentContext();
	const pageDocId = metadata.data?.id;
	const isFolder = node.type === NodeType.Folder;
	const isSelected = node.id === pageDocId;

	const handleClick = () => {
		if (isFolder) {
			// For folders, toggle expansion
			setExpanded((prev) => !prev);
		} else {
			// For documents, navigate to the document
			navigate({
				to: "/docs/$docId",
				params: { docId: node.id },
			});
		}
	};

	const handleDelete = async () => {
		if (
			!window.confirm(
				`Are you sure you want to delete "${node.title}"?${
					hasChildren ? " This will also delete all items inside." : ""
				}`,
			)
		) {
			return;
		}

		try {
			await deleteNote(node.id);
			// If we deleted the current document, navigate to root
			if (node.id === pageDocId) {
				navigate({ to: "/" });
			}
		} catch (error) {
			console.error("Failed to delete:", error);
		}
	};

	return (
		<Box
			sx={{
				position: "relative",
				backgroundColor: isSelected ? "background.level1" : "unset",
				borderRadius: "4px",
				"&:hover .item-actions": {
					opacity: 1,
				},
			}}
		>
			<Button
				variant="plain"
				size="md"
				color="neutral"
				sx={{
					minWidth: "100%",
					justifyContent: "flex-start",
					pr: hasChildren ? "60px" : "36px",
				}}
				onClick={handleClick}
				startDecorator={
					isFolder ? <Folder size={16} /> : <FileText size={16} />
				}
			>
				<Box
					sx={{
						flex: 1,
						textAlign: "left",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{node.title}
				</Box>
			</Button>

			{/* Action buttons container */}
			<Stack
				className="item-actions"
				direction="row"
				spacing={0}
				sx={{
					position: "absolute",
					right: hasChildren ? 28 : 4,
					top: "50%",
					transform: "translateY(-50%)",
					opacity: 0,
					transition: "opacity 0.15s ease-in-out",
				}}
			>
				<Dropdown>
					<MenuButton
						variant="plain"
						size="sm"
						color="neutral"
						sx={{
							padding: 0,
							minWidth: 24,
							minHeight: 24,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<MoreHorizontal size={14} />
					</MenuButton>
					<Menu placement="bottom-end" size="sm">
						<MenuItem onClick={onRenameClick}>
							<Pencil size={14} />
							Rename
						</MenuItem>
						<MenuItem onClick={onMoveClick}>
							<FolderInput size={14} />
							Move to...
						</MenuItem>
						<MenuItem onClick={handleDelete} color="danger">
							<Trash2 size={14} />
							Delete
						</MenuItem>
					</Menu>
				</Dropdown>
			</Stack>

			{hasChildren && (
				<Button
					variant="plain"
					size="sm"
					color="neutral"
					sx={{
						position: "absolute",
						right: 4,
						top: "50%",
						transform: "translateY(-50%)",
						padding: 0,
						minWidth: 24,
						minHeight: 24,
					}}
					onClick={(e) => {
						e.stopPropagation();
						setExpanded((prev) => !prev);
					}}
				>
					<ChevronDown
						size={16}
						style={{
							rotate: isExpanded ? "180deg" : "0deg",
							transition: "rotate 0.2s ease-in-out",
						}}
					/>
				</Button>
			)}
		</Box>
	);
};
