import { Box, Stack } from "@mui/joy";
import { CreateDocumentComponent } from "./components/CreateDocumentCard";
import { DocumentListCard } from "./components/document-list/DocumentListCard";
import { LandingHeader } from "./components/LandingHeader";

export const LandingPage = () => {
	return (
		<Box
			sx={{
				minHeight: "calc(100vh - 64px)",
				px: { xs: 3, md: 6 },
				py: 4,
				bgcolor: "background.body",
			}}
		>
			<Stack spacing={3}>
				<LandingHeader />
				<CreateDocumentComponent />
				<DocumentListCard />
			</Stack>
		</Box>
	);
};
