import { Box } from "@mui/joy";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDocumentPageLayoutContext } from "../../layout/context/DocumentPageLayoutContext";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;

export const SidebarResizeHandle = () => {
	const { sidebarState, setSidebarState } =
		useDocumentPageLayoutContext();
	const [isResizing, setIsResizing] = useState(false);
	const resizeRef = useRef<{
		startX: number;
		startWidth: number;
	} | null>(null);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			setIsResizing(true);
			resizeRef.current = {
				startX: e.clientX,
				startWidth: sidebarState.width,
			};
		},
		[sidebarState.width],
	);

	useEffect(() => {
		if (!isResizing) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (!resizeRef.current) return;

			const deltaX = e.clientX - resizeRef.current.startX;
			const newWidth = Math.min(
				MAX_SIDEBAR_WIDTH,
				Math.max(MIN_SIDEBAR_WIDTH, resizeRef.current.startWidth + deltaX),
			);

			setSidebarState((prev) => ({
				...prev,
				width: newWidth,
				computeWidthOnOverflow: false,
			}));
		};

		const handleMouseUp = () => {
			setIsResizing(false);
			resizeRef.current = null;

			setSidebarState((prev) => {
				const newState = {
					...prev,
					computeWidthOnMount: false,
				};
				return newState;
			});
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing, setSidebarState]);

	return (
		<Box
			role="separator"
			aria-orientation="vertical"
			aria-label="Resize sidebar"
			onMouseDown={handleMouseDown}
			sx={{
				position: "absolute",
				right: "-3px",
				top: 0,
				bottom: 0,
				width: "6px",
				cursor: "col-resize",
				backgroundColor: "transparent",
				transition: "background-color 0.15s ease",
				zIndex: 20,
				"&:hover": {
					backgroundColor: "rgba(25, 118, 210, 0.4)",
				},
				...(isResizing && {
					backgroundColor: "rgba(25, 118, 210, 0.6)",
				}),
			}}
			data-e2e="sidebar-resize-handle"
		/>
	);
};
