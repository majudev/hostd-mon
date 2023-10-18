import React from 'react';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';
import formatDate from '@/utils/formatDate.ts';
import {ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell} from 'recharts';
import {v4 as uuidv4} from 'uuid';
import {Box, Typography} from '@mui/material';
import Grid from '@mui/material/Grid';

type ChartDataRecord = {
	datetime: string,
	up: 1 | 0
}

type SatelliteUptimeData = {
	satelliteName: string,
	entries: Array<ChartDataRecord>
};

const UptimeChart: React.FC = () => {
		const {uptimeEntries, satellites} = useHostDmon() as HostDmonContext;

		if (uptimeEntries == null || satellites == null) return <></>;

		// shape data for recharts library
		const satellitesUptimeData = satellites.map(satellite => {
			return {
				satelliteName: satellite.name,
				entries: uptimeEntries.ExtramonUptimeEntries.map((entry, i) => {
					return {
						datetime: formatDate(entry.timestamp),
						up: entry.satellites[satellite.name] ? 1 : 0,
					}
				})
			};
		}) as Array<SatelliteUptimeData>;

		const renderTooltip = (props: any) => {
			const {active, payload} = props;

			if (active && payload && payload.length) {
				const data = payload[0] && payload[0].payload;

				return (
					<div
						style={{
							backgroundColor: '#fff',
							border: '1px solid #999',
							margin: 0,
							padding: 10,
						}}
					>
						<p>{data.datetime}</p>
						<p>
							<span>status: </span>
							<span style={{color: data.up ? 'green' : 'red', fontWeight: 'bold'}}>{data.up ? 'up' : 'down'}</span>
						</p>
					</div>
				);
			}

			return null;
		};

		return <>
			{
				satellitesUptimeData.map(satelliteUptimeData => <Box key={uuidv4()} mt={2} mb={1}>
						<Typography>{satelliteUptimeData.satelliteName}</Typography>
						<ResponsiveContainer width="100%" height={30}>
							<ScatterChart
								width={800}
								height={100}
								margin={{
									top: 20,
									right: 0,
									bottom: 0,
									left: 0,
								}}
							>
								<XAxis
									type="category"
									dataKey="datetime"
									name="datetime"
									display="none"
								/>
								<YAxis
									type="number"
									dataKey="up"
									height={0}
									width={0}
									tick={false}
									tickLine={false}
									axisLine={false}
								/>

								<Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}} content={renderTooltip}/>

								<Scatter data={satelliteUptimeData.entries}>
									{satelliteUptimeData.entries.map(entry => (
										<Cell
											key={uuidv4()}
											fill={entry.up ? 'green' : 'red'}
										/>
									))}
								</Scatter>
							</ScatterChart>
						</ResponsiveContainer>

						{
							satelliteUptimeData.entries.length > 0 &&
                      <Grid container spacing={2} columns={3}>
                          <Grid item xs={1}>
                              <Typography variant="caption">
											{satelliteUptimeData.entries[0]?.datetime}
                              </Typography>
                          </Grid>
                          <Grid item xs={1} sx={{textAlign: 'center'}}>
                              <Typography variant="caption">
											{satelliteUptimeData.entries[Math.round(satelliteUptimeData.entries.length / 2)]?.datetime}
                              </Typography>
                          </Grid>
                          <Grid item xs={1} sx={{textAlign: 'right'}}>
                              <Typography variant="caption">
											{satelliteUptimeData.entries.pop()?.datetime}
                              </Typography>
                          </Grid>
                      </Grid>
						}
					</Box>
				)
			}
		</>;
	}
;

export default UptimeChart;
