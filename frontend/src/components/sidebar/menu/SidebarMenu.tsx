import React from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import {useHostDmon} from '@/context/HostDmonContext';
import SidebarMenuItem from '@/components/sidebar/menu/SidebarMenuItem';
import {useSidebar} from '@/context/SidebarContext';
import DvrIcon from '@mui/icons-material/Dvr';

const SidebarMenu: React.FC = () => {
	const {currentUser} = useHostDmon();
	const {isSidebarOpen, setIsSidebarOpen} = useSidebar();

	if (currentUser == null) return <></>;

	return <>

		<SidebarMenuItem
			linkTo={`/user/${currentUser.id}`}
			text="Account"
			title="Account settings"
			icon={<AccountCircleOutlinedIcon/>}
		/>

		{currentUser.admin &&
          <SidebarMenuItem
              linkTo={`/users`}
              text="Manage users"
              title="Manage users"
              icon={<SupervisorAccountIcon/>}
          />
		}

		{!isSidebarOpen &&
          <SidebarMenuItem
              onClick={() => setIsSidebarOpen(true)}
              text="Hosts"
              title="Your hosts"
              icon={<DvrIcon/>}
          />
		}
	</>;
};

export default SidebarMenu;
