import { useNavigate } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { BaseSidebarButton } from "./BaseSidebarButton";

export const SettingsButton = () => {
	const navigate = useNavigate();

	const handleClick: React.MouseEventHandler<HTMLAnchorElement> = async (
		event,
	) => {
		if (event && (event.ctrlKey || event.metaKey)) {
			window.open("/settings", "_blank");
		} else {
			navigate({ to: "/settings" });
		}
	};

	return (
		<BaseSidebarButton
			onClick={handleClick}
			buttonStartDecorator={<Settings size={16} />}
			buttonText="Settings"
		/>
	);
};
