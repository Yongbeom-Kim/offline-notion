import { Card, Divider, Stack, Typography } from "@mui/joy";
import { useDocumentPageLayoutContext } from "../../layout/context/DocumentPageLayoutContext";
import { AddDocumentButton } from "./buttons/AddDocumentButton";
import { AddFolderButton } from "./buttons/AddFolderButton";
import { SettingsButton } from "./buttons/SettingsButton";
import { SidebarResizeHandler } from "./resize-handler/SidebarResizer";
import { SidebarDocumentTree } from "./SidebarDocumentTree";
import { SidebarEditProvider } from "./SidebarEditContext";

export const Sidebar = () => {
	const { sidebarState } = useDocumentPageLayoutContext();

	return (
		<SidebarEditProvider>
			<aside>
				<nav>
					<Card
						sx={{
							padding: "24px 16px",
							bgcolor: "Background",
							zIndex: 10,
							height: "100vh",
							display: "flex",
							flexDirection: "column",
							position: "fixed",
							left: 0,
							top: 0,
							width: `${sidebarState.width}px`,
						}}
					>
						<Stack
							direction="column"
							spacing={2}
							sx={{
								flex: 0,
								justifyContent: "flex-start",
								alignItems: "stretch",
								height: "100%",
							}}
							data-e2e="sidebar-stack"
						>
							<Typography
								level="h3"
								sx={{
									px: 2,
									py: 1,
									color: "text.primary",
									fontWeight: 600,
								}}
							>
								Workspace
							</Typography>

							<Divider />

							<SidebarDocumentTree />

							<Divider />

							<Stack spacing={0}>
								<AddDocumentButton />
								<AddFolderButton />
								<SettingsButton />
							</Stack>
						</Stack>
						<SidebarResizeHandler />
					</Card>
				</nav>
			</aside>
		</SidebarEditProvider>
	);
};
