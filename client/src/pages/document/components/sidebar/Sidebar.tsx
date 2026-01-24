import { Card, Divider, Stack, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AddDocumentButton } from "./AddDocumentButton";
import { AddFolderButton } from "./AddFolderButton";
import { SidebarDocumentTree } from "./SidebarDocumentTree";
import { SidebarEditProvider } from "./SidebarEditContext";

const SIDEBAR_STATE_LOCALSTORAGE_KEY = "SIDEBAR_STATE";

type SidebarState = {
	expanded: boolean;
};

const useSidebarState = () => {
	const isLargeScreen = useMediaQuery({
		query: "(min-width: 64rem)",
		ssrFallbackResult: false,
	});

	const getInitialSidebarState = (): SidebarState => {
		if (
			typeof window === "undefined" ||
			localStorage.getItem(SIDEBAR_STATE_LOCALSTORAGE_KEY) === null
		) {
			return {
				expanded: isLargeScreen,
			};
		}

		return JSON.parse(
			localStorage.getItem(SIDEBAR_STATE_LOCALSTORAGE_KEY) ?? "",
		) as SidebarState;
	};

	const [state, setState] = useState<SidebarState>(getInitialSidebarState);

	useEffect(() => {
		localStorage.setItem(SIDEBAR_STATE_LOCALSTORAGE_KEY, JSON.stringify(state));
	}, [state]);

	return [state, setState];
};

export const Sidebar = () => {
	const [_sidebarState, _setSidebarState] = useSidebarState();

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
						}}
					>
						<Stack
							direction="column"
							spacing={2}
							sx={{
								flex: 1,
								justifyContent: "flex-start",
								alignItems: "stretch",
							}}
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
							</Stack>
						</Stack>
					</Card>
				</nav>
			</aside>
		</SidebarEditProvider>
	);
};
