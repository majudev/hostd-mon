import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {getHostAlerts} from '@/api/host';
import Alert from '@/types/Alert.ts';
import Grid from '@mui/material/Grid';
import Title from '@/components/Title.tsx';
import AlertsTable from '@/components/alerts/AlertsTable.tsx';

type HostAlertsProps = {};

const HostAlerts: React.FC<HostAlertsProps> = () => {
	const {id: hostId} = useParams();

	const [hostAlerts, setHostAlerts] = useState<Array<Alert> | null>(null);

	useEffect(() => {
		if (hostId == null) return;
		if (hostAlerts != null) return;

		getHostAlerts(parseInt(hostId)).then(setHostAlerts).catch(console.error);
	}, [hostId]);

	return <>
		<Grid container mb={1}>
			<Grid item xs={12} md={6}>
				<Title>Alerts</Title>
			</Grid>
		</Grid>

		<AlertsTable alerts={hostAlerts ?? []} doNotShowHostLink />
	</>;
};

export default HostAlerts;
