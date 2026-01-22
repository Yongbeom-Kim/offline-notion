import { Box, Button, Stack } from "@mui/joy";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { DocumentMetadata } from "@/db/metadata";
import { useDocumentContext } from "../../context/document-context/DocumentContext";
import {
	type HierarchyData,
	isAncestorOf,
} from "../../utils/document-hierarchy";

type SidebarDocumentTreeProps = {
	hierarchyData: HierarchyData | undefined;
};

export const SidebarDocumentTree = ({
	hierarchyData,
}: SidebarDocumentTreeProps) => {
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
			{hierarchyData?.rootDocumentIds.map((docId) => {
				const document = hierarchyData.documents.get(docId);
				if (!document) return null;

				return (
					<SidebarDocumentTreeItem
						key={docId}
						docMetadata={document}
						hierarchyData={hierarchyData}
					/>
				);
			})}
		</Stack>
	);
};

type SidebarDocumentTreeItemProps = {
	docMetadata: DocumentMetadata | undefined;
	hierarchyData: HierarchyData;
};

type SideBarDocumentTreeItemButtonProps = {
	docMetadata: DocumentMetadata | undefined;
	isExpanded: boolean;
	setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
	hasChildren: boolean;
};

export const SideBarDocumentTreeItemButton = ({
	docMetadata,
	isExpanded,
	setExpanded,
	hasChildren,
}: SideBarDocumentTreeItemButtonProps) => {
	const navigate = useNavigate();
	const { metadata } = useDocumentContext();
	const itemId = docMetadata?.id;
	const pageDocId = metadata.data?.id;

	return (
		<Box
			sx={{
				position: "relative",
				backgroundColor: itemId === pageDocId ? "background.level1" : "unset",
			}}
		>
			<Button
				variant="plain"
				size="md"
				color="neutral"
				sx={{ minWidth: "100%" }}
				onClick={() =>
					navigate({
						to: "/docs/$docId",
						params: {
							docId: docMetadata?.id ?? "",
						},
					})
				}
			>
				<Box sx={{ minWidth: "100%", textAlign: "left" }}>
					{docMetadata?.title}
				</Box>
			</Button>

			{hasChildren && (
				<Button
					variant="plain"
					size="md"
					color="neutral"
					sx={{ position: "absolute", right: 0, padding: 0 }}
					onClick={() => setExpanded((isExpanded) => !isExpanded)}
				>
					<ChevronDown
						style={{
							rotate: isExpanded ? "180deg" : "0deg",
							transition: "all 0.25s ease-in-out",
						}}
					/>
				</Button>
			)}
		</Box>
	);
};

export const SidebarDocumentTreeItem = ({
	docMetadata,
	hierarchyData,
}: SidebarDocumentTreeItemProps) => {
	const { metadata } = useDocumentContext();
	const itemId = docMetadata?.id;
	const pageDocId = metadata.data?.id;

	// Expand all parents of this document.
	const [isExpanded, setExpanded] = useState(() => {
		return (
			itemId === pageDocId ||
			isAncestorOf(itemId || "", pageDocId || "", hierarchyData)
		);
	});

	const hasChildren = !!hierarchyData.childrenMap.get(docMetadata?.id ?? "")
		?.length;

	return (
		<Stack direction="column" spacing={1}>
			<SideBarDocumentTreeItemButton
				docMetadata={docMetadata}
				isExpanded={isExpanded}
				setExpanded={setExpanded}
				hasChildren={hasChildren}
			/>
			{isExpanded && (
				<Box sx={{ paddingLeft: "1rem" }}>
					{hierarchyData.childrenMap
						.get(docMetadata?.id ?? "")
						?.map((child) => (
							<SidebarDocumentTreeItem
								key={child}
								hierarchyData={hierarchyData}
								docMetadata={hierarchyData.documents.get(child)}
							/>
						))}
				</Box>
			)}
		</Stack>
	);
};
