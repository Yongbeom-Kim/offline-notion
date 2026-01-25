import { Box } from "@mui/joy";
import { useState } from "react";
import { Sidebar } from "../components/sidebar";
import { DocumentContextProvider } from "../context/document-context/DocumentContext";

interface DocumentPageLayoutProps {
	children: React.ReactNode;
}

export function DocumentPageLayout({ children }: DocumentPageLayoutProps) {
	const [sidebarWidth, _setSidebarWidth] = useState(250);
	return (
		<DocumentContextProvider>
			<Box
				sx={{
					minHeight: "100vh",
					minWidth: "100vw",
					paddingLeft: `${sidebarWidth}px`,
				}}
				data-e2e="layout-box"
			>
				<Sidebar width={sidebarWidth} />
				{children}
			</Box>
		</DocumentContextProvider>
	);
}
