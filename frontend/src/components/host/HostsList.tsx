import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import AddIcon from '@mui/icons-material/Add';
import ListItemText from '@mui/material/ListItemText';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';
import {Box, Button} from '@mui/material';
import {Link as RouterLink} from "react-router-dom";
import Host from '@/types/Host.ts';

const HostsList = () => {
	const {hosts} = useHostDmon() as HostDmonContext;

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
			{hosts?.map((host: Host) =>
				<RouterLink to={`/host/${host.id}`} key={host.id}>
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