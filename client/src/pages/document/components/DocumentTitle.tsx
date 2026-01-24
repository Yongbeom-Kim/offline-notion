import { Typography } from "@mui/joy";
import { useCallback } from "react";
import { type NodeMetadata, updateNodeTitle } from "@/db/metadata";

type DocumentTitleProps = {
	document: NodeMetadata | null;
	isLoading: boolean;
};

export const DocumentTitle = ({ document, isLoading }: DocumentTitleProps) => {
	const handleTitleSave = useCallback(
		async (newTitle: string) => {
			if (!document) return;

			const trimmed = newTitle.trim() || "Untitled";
			if (trimmed !== document.title) {
				await updateNodeTitle(document.id, trimmed);
			}
		},
		[document],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLHeadingElement>) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleTitleSave(e.currentTarget.textContent || "");
				// Focus the BlockNote editor (uses ProseMirror under the hood)
				const editorElement =
					window.document.querySelector<HTMLElement>(".ProseMirror");
				editorElement?.focus();
			}
		},
		[handleTitleSave],
	);

	if (isLoading) {
		return null;
	}

	return (
		<Typography
			level="h1"
			contentEditable
			suppressContentEditableWarning
			role="textbox"
			tabIndex={0}
			onBlur={(e) => handleTitleSave(e.currentTarget.textContent || "")}
			onKeyDown={handleKeyDown}
			sx={{
				fontSize: "2.5rem",
				fontWeight: 700,
				lineHeight: 1.2,
				color: "var(--joy-palette-text-primary)",
				mb: 4,
				py: "0.5rem",
				border: "none",
				outline: "none",
				background: "transparent",
				minHeight: "3rem",
				cursor: "text",
				pl: "54px",
			}}
			data-placeholder="Untitled"
		>
			{document?.title ?? "Untitled"}
		</Typography>
	);
};
