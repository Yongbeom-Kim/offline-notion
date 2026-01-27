import { Box, CircularProgress, Typography } from "@mui/joy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	createNode,
	NodeType,
	useGetRootNodes,
} from "@/integrations/db/metadata";

function LandingRedirect() {
	const navigate = useNavigate();
	const { rootNodes, isLoading } = useGetRootNodes();
	const [isNavCalled, setIsNavCalled] = useState(false);
	const latestRootDocument = rootNodes?.[NodeType.Document]?.[0] ?? null;

	useEffect(() => {
		if (isLoading) return;

		const redirectToDocument = async () => {
			if (latestRootDocument) {
				setIsNavCalled(true);
				// short delay between calling navigate() and actual navigation, prevent showing error screen
				navigate({
					to: "/docs/$docId",
					params: { docId: latestRootDocument.id },
				});
				return;
			}

			try {
				const newDocId = await createNode("Welcome", NodeType.Document);
				navigate({ to: "/docs/$docId", params: { docId: newDocId } });
			} catch (error) {
				console.error("Failed to create welcome document:", error);
			}
		};

		redirectToDocument();
	}, [latestRootDocument, isLoading, navigate]);

	if (isNavCalled || isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
					gap: 2,
				}}
			>
				<CircularProgress size="lg" />
				<Typography level="body-md">Loading your workspace...</Typography>
			</Box>
		);
	}

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
