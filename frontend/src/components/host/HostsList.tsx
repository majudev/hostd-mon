import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import AddIcon from '@mui/icons-material/Add';
import {Box, Button, ListItemText} from '@mui/material';
import {useHostDmon} from '@/context/HostDmonContext';
import Host from '@/types/Host';
import RouterLink from '@/components/RouterLink';

const HostsList = () => {
	const {hosts} = useHostDmon();

	return <>
		<ListSubheader component="div" inset>
			Hosts
			<Box display="inline-block" justifySelf={"flex-end"}>
				<RouterLink to="/host/add">
					<Button size="small" title="Add new host">
						<AddIcon/>
					</Button>
				</RouterLink>
			</Box>
		</ListSubheader>

		<Box ml={2}>
			{hosts?.map((host: Host, idx) =>
				<RouterLink to={`/host/${host.id}`} key={idx}>
					<ListItemButton>
						{/*<ListItemIcon>*/}
						{/*<PeopleIcon/>*/}
						{/*</ListItemIcon>*/}
						<ListItemText sx={{textAlign: 'center'}}>
							{host.name}
						</ListItemText>
					</ListItemButton>
				</RouterLink>
			)}
		</Box>
	</>
};

export default HostsList;
