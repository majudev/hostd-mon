import React, {useEffect, useState} from 'react';
import formatDate from '@/utils/formatDate.ts';
import {ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell} from 'recharts';
import {v4 as uuidv4} from 'uuid';
import {Box, Typography, Grid} from '@mui/material';
import {State, StateObject, UptimeResponse, UptimeResponseDataObject} from '@/types/Uptime';
import {getUptimeByHostId} from '@/api/host';
import config from '@/config';
import {useParams} from 'react-router-dom';
import subtractTimeFromDate from '@/utils/subtractTimeFromDate';
import Duration from '@/types/Duration';
import Satellite from '@/types/Satellite';
import {getSatellites} from '@/api/satellites';

type ChartDataRecord = StateObject & {
	datetime: string,
	timestamp: number
};

type SatelliteUptimeData = {
	satelliteName: string,
	extramonEntries: Array<ChartDataRecord>,
	rhpEntries: Array<ChartDataRecord>
};

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

const getColourFromState = (state: State) => {
	switch (state) {
		case 'good':
			return 'green';
		case 'warn':
			return 'yellow';
		case 'fail':
			return 'red';
	}
};

type UptimeChartProps = {
	selectedDuration: Duration,
	loading: boolean,
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
};

const UptimeCharts: React.FC<UptimeChartProps> = ({selectedDuration, loading, setLoading}) => {
	const {id: hostId} = useParams();

	const [satellites, setSatellites] = useState<Array<Satellite> | null>(null);
	const [uptimeEntries, setUptimeEntries] = useState<UptimeResponseDataObject | null>(null);

	useEffect(() => {
		if (hostId == null) return;

		if (satellites == null) {
			getSatellites()
				.then((_satellites: Array<Satellite>) => {
					setSatellites(_satellites);
				})
				.catch(console.error);
		}
	}, [hostId]);

	useEffect(() => {
		if (hostId == null) return;
		if (satellites == null) return;

		const getUptimeDataHandler = () => {
			if (loading) return;

			setLoading(true);

			getUptimeByHostId({
				hostId: parseInt(hostId),
				from: parseDurationTextToDate(selectedDuration),
				to: 'now'
			})
				.then((data: UptimeResponse) => {
					setUptimeEntries(data.data);
				})
				.catch(console.error)
				.finally(() => setLoading(false));
		};

		getUptimeDataHandler();

		const interval = setInterval(getUptimeDataHandler, config.CHARTS.REFRESH_DATA_INTERVAL_MS);

		return () => {
			if (interval != null) {
				clearInterval(interval);
			}
		};
	}, [hostId, selectedDuration, satellites]);

	if (uptimeEntries == null || satellites == null) return <></>;

	// shape data for recharts library
	const satellitesUptimeData = satellites.map(satellite => {
		return {
			satelliteName: satellite.name,
			extramonEntries: uptimeEntries.ExtramonUptimeEntries.map(entry => {
				return {
					datetime: formatDate(entry.timestamp),
					timestamp: new Date(entry.timestamp).getTime(),
					state: entry.satellites[satellite.name].state,
					ping: entry.satellites[satellite.name].ping
				}
			}),
			rhpEntries: uptimeEntries.RHPUptimeEntries.map(entry => {
				return {
					datetime: formatDate(entry.timestamp),
					timestamp: new Date(entry.timestamp).getTime(),
					state: entry.satellites[satellite.name].state,
					ping: entry.satellites[satellite.name].ping,
					rhpv2: entry.satellites[satellite.name].rhpv2,
					rhpv3: entry.satellites[satellite.name].rhpv3
				}
			}),
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
						<span>ping: </span>
						<span style={{
							color: data.state === 'good' ? 'green' : 'red',
							fontWeight: 'bold'
						}}>{data.ping ? 'ok' : 'fail'}</span>
					</p>

					{
						data.rhpv2 !== undefined &&
                   <p>
                       <span>rhpv2: </span>
                       <span style={{
								  color: data.rhpv2 ? 'green' : 'red',
								  fontWeight: 'bold'
							  }}>{data.rhpv2 ? 'ok' : 'fail'}</span>
                   </p>
					}

					{
						data.rhpv3 !== undefined &&
                   <p>
                       <span>rhpv3: </span>
                       <span style={{
								  color: data.rhpv3 ? 'green' : 'red',
								  fontWeight: 'bold'
							  }}>{data.rhpv3 ? 'ok' : 'fail'}</span>
                   </p>
					}
				</div>
			);
		}

		return null;
	};

	return <>
		{
			satellitesUptimeData.map(satelliteUptimeData => <Box key={uuidv4()}>
					<Box key={uuidv4()} mt={2} mb={1}>
						<Typography>{satelliteUptimeData.satelliteName} - rhp</Typography>
						{satelliteUptimeData.rhpEntries.length === 0 &&
                      <Typography mx={1} variant="caption">No entries for given interval</Typography>
						}
						<ResponsiveContainer width="100%" height={30}>
							<ScatterChart
								width={800}
								height={100}
								margin={{
									top: 20,
									right: 10,
									bottom: 0,
									left: 10,
								}}
							>
								<XAxis
									type="number"
									dataKey="timestamp"
									name="timestamp"
									display="none"
									domain={['dataMin', 'dataMax']} // This line sets the domain to the minimum and maximum values in the data
								/>
								<YAxis
									dataKey="timestamp"
									height={0}
									width={0}
									tick={false}
									tickLine={false}
									axisLine={false}
								/>

								<Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}} content={renderTooltip}/>

								<Scatter data={satelliteUptimeData.rhpEntries}>
									{satelliteUptimeData.rhpEntries.map(entry => (
										<Cell
											key={uuidv4()}
											fill={getColourFromState(entry.state)}
										/>
									))}
								</Scatter>
							</ScatterChart>
						</ResponsiveContainer>

						{
							satelliteUptimeData.rhpEntries.length > 2 &&
                      <Grid container spacing={2} columns={3}>
                          <Grid item xs={1}>
                              <Typography variant="caption">
											{satelliteUptimeData.rhpEntries[0]?.datetime}
                              </Typography>
                          </Grid>
                          <Grid item xs={1} sx={{textAlign: 'center'}}></Grid>
                          <Grid item xs={1} sx={{textAlign: 'right'}}>
                              <Typography variant="caption">
											{satelliteUptimeData.rhpEntries.pop()?.datetime}
                              </Typography>
                          </Grid>
                      </Grid>
						}
					</Box>

					<Box key={uuidv4()} mt={2} mb={1}>
						<Typography>{satelliteUptimeData.satelliteName} - extramon</Typography>
						{satelliteUptimeData.extramonEntries.length === 0 &&
                      <Typography mx={1} variant="caption">No entries for given interval</Typography>
						}
						<ResponsiveContainer width="100%" height={30}>
							<ScatterChart
								// width={800}
								// height={100}
								margin={{
									top: 20,
									right: 10,
									bottom: 0,
									left: 10,
								}}
							>
								<XAxis
									type="number"
									dataKey="timestamp"
									name="timestamp"
									display="none"
									domain={['dataMin', 'dataMax']} // This line sets the domain to the minimum and maximum values in the data
								/>
								<YAxis
									dataKey="timestamp"
									height={0}
									width={0}
									tick={false}
									tickLine={false}
									axisLine={false}
								/>

								<Tooltip cursor={{strokeDasharray: '3 3'}} wrapperStyle={{zIndex: 100}} content={renderTooltip}/>

								<Scatter data={satelliteUptimeData.extramonEntries}>
									{satelliteUptimeData.extramonEntries.map(entry => (
										<Cell
											key={uuidv4()}
											fill={getColourFromState(entry.state)}
										/>
									))}
								</Scatter>
							</ScatterChart>
						</ResponsiveContainer>

						{
							satelliteUptimeData.extramonEntries.length > 2 &&
                      <Grid container spacing={2} columns={3}>
                          <Grid item xs={1}>
                              <Typography variant="caption">
											{satelliteUptimeData.extramonEntries[0]?.datetime}
                              </Typography>
                          </Grid>
                          <Grid item xs={1} sx={{textAlign: 'center'}}></Grid>
                          <Grid item xs={1} sx={{textAlign: 'right'}}>
                              <Typography variant="caption">
											{satelliteUptimeData.extramonEntries.pop()?.datetime}
                              </Typography>
                          </Grid>
                      </Grid>
						}
					</Box>
				</Box>
			)
		}
	</>;
};

export default UptimeCharts;
