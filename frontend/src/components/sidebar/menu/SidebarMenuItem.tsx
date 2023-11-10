import React from 'react';
import {Grid, ListItemButton, ListItemIcon, Typography} from '@mui/material';
import RouterLink from '@/components/routing/RouterLink.tsx';
import {useSidebar} from '@/context/SidebarContext.tsx';

type SidebarMenuItemProps = {
	onClick?: () => any,
	linkTo?: string,
	text: string
	title?: string,
	icon?: React.ReactNode
};

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({onClick, linkTo, text, title, icon}) => {
	const {isSidebarOpen} = useSidebar();

	return <RouterLink to={linkTo ?? '#'} onClick={onClick}>
		<ListItemButton title={title}>
			<Grid container>
				<Grid container item xs={3} ml={1}>
					{
						icon && <ListItemIcon>
							{icon}
                   </ListItemIcon>
					}
				</Grid>
				<Grid container item xs={6} alignItems="center" justifyContent="center">
					<Typography>{isSidebarOpen && text}</Typography>
				</Grid>
				<Grid item xs={3}></Grid> {/* dummy grid to center Caption */}
			</Grid>
		</ListItemButton>
	</RouterLink>;
};

export default SidebarMenuItem;
