import { Button, Typography } from "@mui/joy";

export type BaseSidebarButtonProps = {
	isLoading?: boolean;
	onClick?: React.MouseEventHandler<HTMLAnchorElement>;
	buttonStartDecorator: React.ReactNode;
	buttonText: string;
};

export const BaseSidebarButton = ({
	isLoading,
	onClick,
	buttonStartDecorator,
	buttonText,
}: BaseSidebarButtonProps) => {
	return (
		<Button
			onClick={onClick}
			variant="plain"
			color="neutral"
			loading={isLoading}
			sx={{
				justifyContent: "flex-start",
				pl: 2,
				pr: 2,
				py: 1,
				minHeight: "32px",
				borderRadius: "4px",
				"&:hover": {
					bgcolor: "background.level1",
				},
				"&:disabled": {
					color: "text.tertiary",
				},
			}}
			startDecorator={buttonStartDecorator}
		>
			<Typography
				level="body-sm"
				sx={{
					color: "text.tertiary",
					fontWeight: 400,
				}}
			>
				{buttonText}
			</Typography>
		</Button>
	);
};
