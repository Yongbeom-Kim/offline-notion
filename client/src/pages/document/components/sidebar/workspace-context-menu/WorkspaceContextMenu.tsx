import { Dropdown, Menu, MenuButton, MenuItem } from "@mui/joy";
import { MoreVertical } from "lucide-react";
import { useGoogleProvider } from "@/integrations/google";

export const WorkspaceContextMenu = () => {
	return (
		<Dropdown>
			<MenuButton
				size="sm"
				variant="plain"
				aria-label="Workspace options"
				// Add onClick or Menu logic here as needed
				sx={{ ml: "auto" }}
			>
				<MoreVertical size={18} />
			</MenuButton>
			<Menu>
				<WorkspaceContextMenuSyncStatusItem />
			</Menu>
		</Dropdown>
	);
};

const WorkspaceContextMenuSyncStatusItem = () => {
	const { accessToken, login } = useGoogleProvider();
	// const { uploadMultipart, createFolder, getExistingFolder } = useGoogleDrive()
	const handleClick = async () => {
		if (!accessToken) login();
		// const result = await uploadMultipart(
		// 	'test_file/test',
		// 	'text/plain',
		// 	new TextEncoder().encode('hello')
		// )
		// const folder1 = await createFolder('test')
		// const folder2 = await createFolder('test', folder1)
		// console.log(folder1, folder2)
		// console.log(await getExistingFolder('test'))
	};
	return <MenuItem onClick={handleClick}>Sync Document</MenuItem>;
};
