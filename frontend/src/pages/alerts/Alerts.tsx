import React from 'react';
import {useHostDmon} from '@/context/HostDmonContext';
import Panel from '@/components/Panel';

type AlertsProps = {};

const Alerts: React.FC<AlertsProps> = () => {
	const {userAlerts} = useHostDmon();

	return <Panel>
		{JSON.stringify(userAlerts, null, 3)}
	</Panel>;
};

export default Alerts;
