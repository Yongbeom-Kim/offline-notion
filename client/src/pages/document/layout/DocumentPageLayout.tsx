import { Box } from "@mui/joy";
import { Sidebar } from "../components/sidebar";
import { DocumentContextProvider } from "../context/document-context/DocumentContext";
import {
	DocumentPageLayoutContextProvider,
	useDocumentPageLayoutContext,
} from "./context/DocumentPageLayoutContext";

interface DocumentPageLayoutProps {
	children: React.ReactNode;
}

export const DocumentPageLayout = (props: DocumentPageLayoutProps) => {
	return (
		<DocumentContextProvider>
			<DocumentPageLayoutContextProvider>
				<_DocumentPageLayout {...props}></_DocumentPageLayout>
			</DocumentPageLayoutContextProvider>
		</DocumentContextProvider>
	);
};

const _DocumentPageLayout = ({ children }: DocumentPageLayoutProps) => {
	const { sidebarState } = useDocumentPageLayoutContext();
	return (
		<Box
			sx={{
				minHeight: "100vh",
				minWidth: "100vw",
				paddingLeft: `${sidebarState.width}px`,
			}}
			data-e2e="layout-box"
		>
			<Sidebar />
			{children}
		</Box>
	);
};
