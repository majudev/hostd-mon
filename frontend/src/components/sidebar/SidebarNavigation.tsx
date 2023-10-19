import React from 'react';
import {Divider, List} from '@mui/material';
import SidebarHostsList from '@/components/sidebar/SidebarHostsList';
import SidebarMenu from '@/components/sidebar/SidebarMenu';

const SidebarNavigation: React.FC = () => {
	return <List component="nav">
		<SidebarHostsList />

		<Divider sx={{my: 1}}/>

		<SidebarMenu />
	</List>;
};

export default SidebarNavigation;
