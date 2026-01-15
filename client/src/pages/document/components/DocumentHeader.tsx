import { Button, Stack, Typography } from "@mui/joy";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const DocumentHeader = () => {
	return (
		<Stack spacing={1}>
			<Button
				variant="plain"
				component={Link}
				to="/"
				startDecorator={<ArrowLeft size={16} />}
				sx={{ alignSelf: "flex-start" }}
			>
				All documents
			</Button>
			<Typography level="h1">Document workspace</Typography>
			<Typography level="body-md" textColor="text.secondary">
				Changes are stored locally in IndexedDB.
			</Typography>
		</Stack>
	);
};
