import { Button, Card, Stack, Typography } from "@mui/joy";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const DocumentNotFoundCard = () => {
	return (
		<Card variant="soft" sx={{ p: 4, maxWidth: 560 }}>
			<Stack spacing={2}>
				<Typography level="h2">Document not found</Typography>
				<Typography level="body-md" textColor="text.secondary">
					This document may have been deleted on this device.
				</Typography>
				<Button
					component={Link}
					to="/"
					startDecorator={<ArrowLeft size={16} />}
				>
					Back to documents
				</Button>
			</Stack>
		</Card>
	);
};
