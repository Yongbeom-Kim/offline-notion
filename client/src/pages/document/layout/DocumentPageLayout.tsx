import { Box } from "@mui/joy";
import { Sidebar } from "../components/sidebar";
import { DocumentContextProvider } from "../context/document-context/DocumentContext";

interface DocumentPageLayoutProps {
	children: React.ReactNode;
}

export function DocumentPageLayout({ children }: DocumentPageLayoutProps) {
	return (
		<DocumentContextProvider>
			<Box
				sx={{ display: "flex", flexDirection: "row", minHeight: "100vh" }}
				data-e2e="layout-box"
			>
				<Sidebar />
				{children}
			</Box>
		</DocumentContextProvider>
	);
}
