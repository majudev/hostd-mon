import React from 'react';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import EditHost from '@/pages/host/EditHost.tsx';

const HostOverview: React.FC = () => {
	// const {id: hostId} = useParams();

	return <>
		<Grid item xs={12} md={8} lg={9}>
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
	</>;
};

export default HostOverview;
