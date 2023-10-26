import React from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import {useHostDmon} from '@/context/HostDmonContext';
import SidebarMenuItem from '@/components/sidebar/SidebarMenuItem';

const SidebarMenu: React.FC = () => {
	const {currentUser} = useHostDmon();

	if (currentUser == null) return <></>;

	return <>
		<SidebarMenuItem
			linkTo={`/user/${currentUser.id}`}
			text="Account"
			title="Account setting"
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
	</>;
};

export default SidebarMenu;
