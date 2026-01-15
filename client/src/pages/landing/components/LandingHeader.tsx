import { Stack, Typography } from "@mui/joy";

export const LandingHeader = () => {
	return (
		<Stack spacing={1}>
			<Typography level="h1">Your offline workspace</Typography>
			<Typography level="body-lg" textColor="text.secondary">
				Create and manage local-only documents stored in IndexedDB.
			</Typography>
		</Stack>
	);
};
