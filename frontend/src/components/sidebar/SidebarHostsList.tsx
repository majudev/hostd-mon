import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import AddIcon from '@mui/icons-material/Add';
import {Box, Button, ListItemText, Typography} from '@mui/material';
import {useHostDmon} from '@/context/HostDmonContext.tsx';
import {v4 as uuidv4} from 'uuid';
import RouterLink from '@/components/routing/RouterLink';
import Grid from '@mui/material/Grid';

const SidebarHostsList = () => {
	const {hosts} = useHostDmon();

	return <>
		<ListSubheader sx={{paddingRight: 0}}>
			<Grid container>
				<Grid item xs={3}></Grid> {/* dummy grid to center Caption */}
				<Grid container item xs={6} alignItems="center" justifyContent="center">
					<Typography>Your hosts</Typography>
				</Grid>
				<Grid item xs={3}>
					<RouterLink to="/host/add">
						<Button title="Add new host" sx={{width: '100%', height: '100%'}}>
							<AddIcon/>
						</Button>
					</RouterLink>
				</Grid>
			</Grid>
		</ListSubheader>

		<Box ml={2}>
			{hosts == null || hosts.length === 0 ?
				<Typography textAlign="center">Noting to show</Typography> :
				hosts.map(host =>
					<RouterLink to={`/host/${host.id}`} key={uuidv4()}>
						<ListItemButton>
							<ListItemText sx={{textAlign: 'center'}}>
								{host.name}
							</ListItemText>
						</ListItemButton>
					</RouterLink>
				)
			}
		</Box>
	</>
};

export default SidebarHostsList;
