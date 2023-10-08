import React from 'react';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import EditHost from '@/pages/host/EditHost.tsx';
import {useParams} from 'react-router-dom';
import {getUptimeByHostId} from '@/api/host';
import UptimePanel from '@/pages/host/uptime/UptimePanel.tsx';

const HostOverview: React.FC = () => {
	// const {id: hostId} = useParams();

	return <Grid container spacing={3}>
		<Grid item xs={12} md={12} lg={12}>
			<Paper
				sx={{
					p: 2,
					display: 'flex',
					flexDirection: 'column',
					// height: 240,
				}}
			>
				<UptimePanel />
			</Paper>
		</Grid>

		<Grid item xs={6} md={6} lg={6}>
			<Paper
				sx={{
					p: 2,
					display: 'flex',
					flexDirection: 'column',
					// height: 240,
				}}
			>
				<EditHost/>
			</Paper>
		</Grid>
	</Grid>;
};

export default HostOverview;
