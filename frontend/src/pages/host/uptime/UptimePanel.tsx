import React, {useState} from 'react';
import Grid from '@mui/material/Grid';
import {Button, ButtonGroup} from '@mui/material';
import Title from '@/components/Title';
import UptimeCharts from '@/components/host/uptime/UptimeCharts';
import {v4 as uuidv4} from 'uuid';
import config from '@/config';
import Duration from '@/types/Duration';

const UptimePanel: React.FC = () => {
	const [selectedDuration, setSelectedDuration] = useState<Duration>(config.CHARTS.DURATION_BUTTONS[0]);
	const [loading, setLoading] = useState<boolean>(false);

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

		<UptimeCharts selectedDuration={selectedDuration} loading={loading} setLoading={setLoading}/>
	</>;
};

export default UptimePanel;
