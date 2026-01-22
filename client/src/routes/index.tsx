import { Box, Typography } from "@mui/joy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { createDocumentMetadata } from "@/db/metadata";
import { useDocumentHierarchy } from "@/hooks/use-document-hierarchy";

function LandingRedirect() {
	const navigate = useNavigate();
	const { hierarchy, isLoading } = useDocumentHierarchy();

	useEffect(() => {
		if (isLoading) return;

		const redirectToDocument = async () => {
			const latestRoot = hierarchy?.rootDocumentIds.length
				? hierarchy.documents.get(hierarchy.rootDocumentIds[0])
				: null;

			if (latestRoot) {
				navigate({ to: "/docs/$docId", params: { docId: latestRoot.id } });
				return;
			}

			try {
				const newDocId = await createDocumentMetadata("Welcome");
				navigate({ to: "/docs/$docId", params: { docId: newDocId } });
			} catch (error) {
				console.error("Failed to create welcome document:", error);
			}
		};

		redirectToDocument();
	}, [hierarchy, isLoading, navigate]);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "50vh",
				gap: 2,
			}}
		>
			<Typography level="body-lg" color="danger">
				Failed to load your workspace.
			</Typography>
			<Box>
				<a
					href="/"
					onClick={(e) => {
						e.preventDefault();
						window.location.reload();
					}}
					style={{
						display: "inline-block",
						padding: "8px 16px",
						border: "none",
						borderRadius: 4,
						background: "#1976d2",
						color: "#fff",
						cursor: "pointer",
						fontSize: 16,
						textDecoration: "none",
					}}
				>
					Retry
				</a>
			</Box>
		</Box>
	);
}

export const Route = createFileRoute("/")({ component: LandingRedirect });
