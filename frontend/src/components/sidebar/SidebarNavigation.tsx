import React from 'react';
import {Divider, List} from '@mui/material';
import SidebarHostsList from '@/components/sidebar/SidebarHostsList';
import SidebarMenu from '@/components/sidebar/menu/SidebarMenu.tsx';
import {useSidebar} from '@/context/SidebarContext.tsx';

const SidebarNavigation: React.FC = () => {
	const {isSidebarOpen} = useSidebar();

	return <List component="nav">
		<SidebarMenu/>

		{isSidebarOpen &&
          <>
              <Divider sx={{my: 1}}/>
              <SidebarHostsList/>
          </>
		}
	</List>;
};

export default SidebarNavigation;
