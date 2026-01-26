import { Box } from "@mui/joy";
import { useCallback, useEffect, useRef } from "react";
import { useDocumentPageLayoutContext } from "@/pages/document/layout/context/DocumentPageLayoutContext";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;

// TODO: Performance Sucks (https://docs.yongbeom.com/docs/019bf109-bc3d-732c-88f1-d8607460cfff)
// Update DOM live, and then call setState at the end once only.
export const SidebarResizeHandler = () => {
	const { setSidebarState } = useDocumentPageLayoutContext();
	const isDraggingRef = useRef(false);
	const startingStateRef = useRef({
		mouseXPos: 0,
		sidebarWidth: 0,
	});

	const onMouseDown = useCallback<React.MouseEventHandler<HTMLDivElement>>(
		(ev) => {
			isDraggingRef.current = true;
			setSidebarState((prev) => {
				startingStateRef.current = {
					mouseXPos: ev.clientX,
					sidebarWidth: prev.width,
				};
				return { ...prev, computeWidthOnOverflow: false };
			});
		},
		[setSidebarState],
	);

	const onDoubleClick = useCallback<React.MouseEventHandler<HTMLDivElement>>(
		(_ev) => {
			setSidebarState((prev) => ({
				...prev,
				computeWidthOnOverflow: true,
				width: prev.optimalWidth,
			}));
		},
		[setSidebarState],
	);

	const onMouseMove = useCallback(
		(ev: MouseEvent) => {
			if (!isDraggingRef.current) return;
			const newSidebarWidth =
				ev.clientX -
				startingStateRef.current.mouseXPos +
				startingStateRef.current.sidebarWidth;
			const newSidebarWidthClamped = Math.max(
				MIN_SIDEBAR_WIDTH,
				Math.min(MAX_SIDEBAR_WIDTH, newSidebarWidth),
			);
			setSidebarState((prev) => ({
				...prev,
				width: newSidebarWidthClamped,
			}));
		},
		[setSidebarState],
	);

	const onMouseUp = useCallback(() => {
		isDraggingRef.current = false;
	}, []);

	useEffect(() => {
		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
		return () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};
	}, [onMouseMove, onMouseUp]);

	return (
		<Box
			onMouseDown={onMouseDown}
			onDoubleClick={onDoubleClick}
			sx={{
				position: "absolute",
				right: 0,
				top: 0,
				height: "100%",
				width: "10px",
				padding: 0,
				margin: 0,
				marginRight: "-5px",
				cursor: "col-resize",
				"&:hover": {
					bgcolor: "neutral.softHoverBg",
					cursor: "col-resize",
				},
				"&:active": {
					bgcolor: "neutral.softActiveBg",
				},
			}}
			data-e2e="sidebar-resize-handler"
		></Box>
	);
};
