import React, {useEffect, useState} from 'react';
import Grid from '@mui/material/Grid';
import {Button, ButtonGroup} from '@mui/material';
import Title from '@/components/Title.tsx';
import {getUptimeByHostId} from '@/api/host';
import {useParams} from 'react-router-dom';
import {UptimeResponse} from '@/types/Uptime.tsx';
import subtractTimeFromDate from '@/utils/subtractTimeFromDate.ts';
import UptimeChart from '@/pages/host/uptime/UptimeChart.tsx';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';
import {v4 as uuidv4} from 'uuid';
import config from '@/config';

type Duration = typeof config.CHARTS.DURATION_BUTTONS[number];

const parseDurationTextToDate = (duration: Duration): Date => {
	return duration === 'max' ?
		new Date(0) :
		subtractTimeFromDate(
			new Date(),
			{
				hours: duration.endsWith('h') ? parseInt(duration?.split('h')[0] ?? '0') : undefined,
				days: duration.endsWith('d') ? parseInt(duration?.split('d')[0] ?? '0') : undefined,
				years: duration.endsWith('y') ? parseInt(duration?.split('y')[0] ?? '0') : undefined,
			}
		);
};

const UptimePanel: React.FC = () => {
	const {id: hostId} = useParams();

	const {setUptimeEntries} = useHostDmon() as HostDmonContext;

	const [selectedDuration, setSelectedDuration] = useState<Duration>(config.CHARTS.DURATION_BUTTONS[0]);

	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (hostId == null) return;
		const getUptimeHandler = () => {
			if (loading) return;

			setLoading(true);

			getUptimeByHostId({
				hostId: parseInt(hostId),
				from: parseDurationTextToDate(selectedDuration),
				to: 'now'
			}).then((data: UptimeResponse) => {
				setUptimeEntries(data.data);
			}).catch(console.error);

			setLoading(false);
		};

		getUptimeHandler();

		const interval = setInterval(getUptimeHandler, config.CHARTS.REFRESH_DATA_INTERVAL_MS);

		return () => {
			if (interval != null) {
				clearInterval(interval);
			}
		};
	}, [hostId, selectedDuration]);

	return <>
		<Grid container mb={1}>
			<Grid item xs={12} md={6}>
				<Title>Uptime</Title>
			</Grid>
			<Grid item xs={12} md={6} style={{display: 'flex', justifyContent: 'flex-end'}}>
				<ButtonGroup>
					{config.CHARTS.DURATION_BUTTONS
						.map(text => <Button
							sx={{textTransform: 'capitalize'}}
							size="small"
							variant={selectedDuration === text ? 'contained' : 'outlined'}
							onClick={() => setSelectedDuration(text)}
							disabled={loading}
							key={uuidv4()}
						>
							{text}
						</Button>)
					}
				</ButtonGroup>
			</Grid>
		</Grid>

		<UptimeChart/>
	</>;
};

export default UptimePanel;
