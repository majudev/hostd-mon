import React from 'react';
import {useHostDmon} from '@/context/HostDmonContext';
import Panel from '@/components/Panel';
import {Grid} from '@mui/material';
import AlertsTable from '@/components/alerts/AlertsTable.tsx';

type AlertsProps = {};

const Alerts: React.FC<AlertsProps> = () => {
	const {userAlerts} = useHostDmon();

	return <Grid container spacing={3}>
		<Panel item xs={12} md={12} lg={12}>
			<AlertsTable alerts={userAlerts ?? []}/>
		</Panel>
	</Grid>;
};

export default Alerts;
