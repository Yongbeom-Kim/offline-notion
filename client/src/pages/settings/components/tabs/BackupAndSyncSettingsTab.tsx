import {
	Alert,
	Button,
	CircularProgress,
	Tab,
	TabPanel,
	Typography,
} from "@mui/joy";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useGoogleProvider } from "@/integrations/google";

const TAB_VALUE = "backup_and_sync";

const TabComponent = () => {
	return (
		<Tab
			variant="plain"
			color="neutral"
			indicatorPlacement="left"
			value={TAB_VALUE}
			sx={{ paddingY: 2, paddingX: 4 }}
		>
			Backup & Sync
		</Tab>
	);
};

// Function to create a test file in Google Drive
async function createTestFileInDrive(
	accessToken: string,
): Promise<{ id: string; name: string }> {
	const metadata = {
		name: "offline-notion-test-file.txt",
		mimeType: "text/plain",
	};

	const fileContent = `This is a test file created by Offline Notion at ${new Date().toISOString()}`;

	// Create the multipart request body
	const boundary = "-------314159265358979323846";
	const delimiter = `\r\n--${boundary}\r\n`;
	const closeDelimiter = `\r\n--${boundary}--`;

	const multipartRequestBody =
		delimiter +
		"Content-Type: application/json; charset=UTF-8\r\n\r\n" +
		JSON.stringify(metadata) +
		delimiter +
		"Content-Type: text/plain\r\n\r\n" +
		fileContent +
		closeDelimiter;

	const response = await fetch(
		"https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": `multipart/related; boundary="${boundary}"`,
			},
			body: multipartRequestBody,
		},
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error?.message || "Failed to create file");
	}

	return response.json();
}

export const TabPanelComponent = () => {
	const { login, accessToken } = useGoogleProvider();
	const isLoggedIn = accessToken !== null;

	return (
		<TabPanel value={TAB_VALUE} sx={{ padding: 4 }}>
			<Typography level="h2" sx={{ mb: 3 }}>
				Backup and Sync
			</Typography>
			<Typography level="h3" sx={{ mb: 2 }}>
				Google Drive Backup
			</Typography>
			<Typography level="body-md" sx={{ mb: 2 }}>
				Sync your documents to Google Drive (also works for cross-device sync).
			</Typography>

			{isLoggedIn ? (
				<Typography level="body-md" sx={{ color: "success.700", mb: 2 }}>
					Logged in!
				</Typography>
			) : (
				<Button
					onClick={() => login()}
					disabled={status === "loading"}
					startDecorator={
						status === "loading" ? <CircularProgress size="sm" /> : null
					}
					sx={{ mb: 2 }}
				>
					{status === "loading"
						? "Creating test file..."
						: "Log into Google Drive"}
				</Button>
			)}

			{accessToken && status === "success" && (
				<Typography level="body-sm" sx={{ mt: 2, color: "text.secondary" }}>
					Access token obtained. Check your Google Drive for the test file.
				</Typography>
			)}
		</TabPanel>
	);
};

export const BackupAndSync = {
	Tab: TabComponent,
	TabPanel: TabPanelComponent,
};
