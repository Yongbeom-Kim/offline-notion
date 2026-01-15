import { Chip, IconButton, Stack, Typography } from "@mui/joy";
import { RefreshCcw } from "lucide-react";
import { useMemo } from "react";
import type { DocumentMetadata } from "@/hooks/use-document-store";

type DocumentListCardHeaderProps = {
	documentList: DocumentMetadata[];
	isLoading: boolean;
	refreshDocumentList: () => void;
};

export const DocumentListCardHeader = ({
	documentList,
	isLoading,
	refreshDocumentList,
}: DocumentListCardHeaderProps) => {
	const summaryLabel = useMemo(() => {
		if (isLoading) {
			return "Loading documents";
		}
		if (documentList === undefined || documentList.length === 0) {
			return "No documents yet";
		}
		return `${documentList.length} documents saved locally`;
	}, [documentList, isLoading]);

	return (
		<Stack direction="row" justifyContent="space-between">
			<Typography level="title-md">All documents</Typography>
			<Stack direction="row" spacing={1} alignItems="center">
				<Chip variant="soft" color="primary">
					{summaryLabel}
				</Chip>
				<IconButton
					variant="plain"
					size="sm"
					onClick={refreshDocumentList}
					disabled={isLoading}
					aria-label="Refresh documents"
				>
					<RefreshCcw size={16} />
				</IconButton>
			</Stack>
		</Stack>
	);
};
