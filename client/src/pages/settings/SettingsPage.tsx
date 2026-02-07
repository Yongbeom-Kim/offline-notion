import { Box, Tab, TabList, TabPanel, Tabs, Typography } from "@mui/joy";
import { SettingsPageHeader } from "./components/header/SettingsPageHeader";
import { BackupAndSync } from "./components/tabs/BackupAndSyncSettingsTab";

export const SettingsPage = () => {
	return (
		<Box
			sx={{
				position: "fixed",
				left: 0,
				top: 0,
				height: "100vh",
				width: "100%",
				overflow: "auto",
				display: "flex",
				flexDirection: "column",
				gap: 0,
			}}
		>
			<SettingsPageHeader />
			<Tabs
				orientation="vertical"
				size="lg"
				sx={{
					width: "100%",
					height: "100%",
				}}
			>
				<TabList>
					<BackupAndSync.Tab />
					<Tab variant="plain" color="neutral" value={2}>
						2
					</Tab>
					<Tab variant="plain" color="neutral" value={3}>
						3
					</Tab>
					<Tab variant="plain" color="neutral" value={4}>
						4
					</Tab>
				</TabList>
				<TabPanel value={undefined}>None Selectedr</TabPanel>
				<BackupAndSync.TabPanel />
				<TabPanel value={2}>2</TabPanel>
				<TabPanel value={3}>3</TabPanel>
				<TabPanel value={4}>4</TabPanel>
			</Tabs>
		</Box>
	);
};
