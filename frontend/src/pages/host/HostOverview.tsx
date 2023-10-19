import React from 'react';
import Grid from '@mui/material/Grid';
import EditHost from '@/pages/host/EditHost';
import UptimePanel from '@/pages/host/uptime/UptimePanel';
import Panel from '@/components/Panel';

const HostOverview: React.FC = () => {
	return <Grid container spacing={3}>
		<Panel item xs={12} md={12} lg={12}>
			<UptimePanel/>
		</Panel>

		<Panel item xs={6} md={6} lg={6}>
			<EditHost/>
		</Panel>
	</Grid>;
};

export default HostOverview;
