import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RouterLink from '@/components/RouterLink.tsx';

export const MainListItems = () => {
	return <>
		<RouterLink to="/test">
			<ListItemButton>
				<ListItemIcon>
					<DashboardIcon/>
				</ListItemIcon>
				<ListItemText>
					test route
				</ListItemText>
			</ListItemButton>
		</RouterLink>
		{/*<ListItemButton>*/}
		{/*	<ListItemIcon>*/}
		{/*		<ShoppingCartIcon/>*/}
		{/*	</ListItemIcon>*/}
		{/*	<ListItemText primary="Orders"/>*/}
		{/*</ListItemButton>*/}
		{/*<ListItemButton>*/}
		{/*	<ListItemIcon>*/}
		{/*		<PeopleIcon/>*/}
		{/*	</ListItemIcon>*/}
		{/*	<ListItemText primary="Customers"/>*/}
		{/*</ListItemButton>*/}
		{/*<ListItemButton>*/}
		{/*	<ListItemIcon>*/}
		{/*		<BarChartIcon/>*/}
		{/*	</ListItemIcon>*/}
		{/*	<ListItemText primary="Reports"/>*/}
		{/*</ListItemButton>*/}
		{/*<ListItemButton>*/}
		{/*	<ListItemIcon>*/}
		{/*		<LayersIcon/>*/}
		{/*	</ListItemIcon>*/}
		{/*	<ListItemText primary="Integrations"/>*/}
		{/*</ListItemButton>*/}
	</>
};

export const SecondaryListItems = () => {
	return <React.Fragment>
		<ListSubheader component="div" inset>
			Saved reports
		</ListSubheader>
		<ListItemButton>
			<ListItemIcon>
				<AssignmentIcon/>
			</ListItemIcon>
			<ListItemText primary="Current month"/>
		</ListItemButton>
		<ListItemButton>
			<ListItemIcon>
				<AssignmentIcon/>
			</ListItemIcon>
			<ListItemText primary="Last quarter"/>
		</ListItemButton>
		<ListItemButton>
			<ListItemIcon>
				<AssignmentIcon/>
			</ListItemIcon>
			<ListItemText primary="Year-end sale"/>
		</ListItemButton>
	</React.Fragment>
};
